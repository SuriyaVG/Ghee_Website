import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { storage } from '../storage';

const router = Router();

// Create a Cashfree order
router.post('/create-cashfree-order', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency = 'INR', customerInfo } = req.body;
    if (!amount || !customerInfo || !customerInfo.customerName || !customerInfo.customerEmail || !customerInfo.customerPhone) {
      const err: any = new Error('Missing amount or customer information for Cashfree order.');
      err.statusCode = 400;
      return next(err);
    }
    const cashfreeConfig = {
      appId: process.env.CASHFREE_APP_ID!,
      secretKey: process.env.CASHFREE_SECRET_KEY!,
      baseUrl: process.env.CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com'
        : 'https://sandbox.cashfree.com',
    };
    const orderData = {
      order_id: `order_${Date.now()}`,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customerInfo.customerName,
        customer_email: customerInfo.customerEmail,
        customer_phone: customerInfo.customerPhone,
      },
      order_meta: {
        return_url: `${req.protocol}://${req.get('host')}/payment-success`,
        notify_url: `${req.protocol}://${req.get('host')}/api/cashfree-webhook`,
      },
    };
    const response = await axios.post(
      `${cashfreeConfig.baseUrl}/pg/orders`,
      orderData,
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': cashfreeConfig.appId,
          'x-client-secret': cashfreeConfig.secretKey,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id,
      amount: response.data.order_amount,
      currency: response.data.order_currency,
    });
  } catch (error) {
    next(error);
  }
});

// Verify Cashfree payment and create DB order
router.post('/verify-cashfree-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cashfreeOrderId, cfPaymentId, customerInfo, items, total } = req.body;
    if (!cashfreeOrderId || !customerInfo || !items || total === undefined) {
      const err: any = new Error('Missing required fields for verification.');
      err.statusCode = 400;
      return next(err);
    }
    const cashfreeConfig = {
      appId: process.env.CASHFREE_APP_ID!,
      secretKey: process.env.CASHFREE_SECRET_KEY!,
      baseUrl: process.env.CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com'
        : 'https://sandbox.cashfree.com',
    };
    const detailsResp = await axios.get(
      `${cashfreeConfig.baseUrl}/pg/orders/${cashfreeOrderId}`,
      { headers: { 'x-api-version': '2022-09-01', 'x-client-id': cashfreeConfig.appId, 'x-client-secret': cashfreeConfig.secretKey } }
    );
    const cfOrderData = detailsResp.data;
    if (cfOrderData.order_status !== 'PAID') {
      const err: any = new Error(`Payment not successful. Status: ${cfOrderData.order_status}`);
      err.statusCode = 400;
      return next(err);
    }
    if (parseFloat(cfOrderData.order_amount) !== parseFloat(total)) {
      const err: any = new Error('Payment amount mismatch. Potential tampering or error.');
      err.statusCode = 400;
      return next(err);
    }
    const orderToCreate = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail,
      customerPhone: customerInfo.customerPhone,
      items: JSON.stringify(items),
      total: total.toString(),
      status: 'paid',
      paymentId: cfOrderData.cf_order_id,
      paymentStatus: 'completed',
    };
    const newOrder = await storage.createOrder(orderToCreate);
    res.status(201).json({ success: true, message: 'Order created after payment verification.', order: newOrder });
  } catch (error) {
    next(error);
  }
});

// Handle Cashfree webhooks for asynchronous updates
router.post('/cashfree-webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receivedSignature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    const payload = JSON.stringify(req.body);

    if (!receivedSignature || !timestamp || !process.env.CASHFREE_SECRET_KEY) {
      const err: any = new Error('Missing webhook signature, timestamp, or server secret.');
      err.statusCode = 400;
      return next(err);
    }

    const crypto = await import('node:crypto');
    const signaturePayload = `${timestamp}${payload}`;
    const hmac = crypto.createHmac('sha256', process.env.CASHFREE_SECRET_KEY);
    hmac.update(signaturePayload);
    const computedSignature = hmac.digest('base64');

    if (computedSignature !== receivedSignature) {
      const err: any = new Error('Invalid webhook signature.');
      err.statusCode = 401;
      return next(err);
    }

    const { data, type } = req.body;
    let orderId, paymentStatus, cfPaymentId;

    if(data && data.order && data.payment) {
        orderId = data.order.order_id;
        paymentStatus = data.payment.payment_status;
        cfPaymentId = data.payment.cf_payment_id;
    }

    if (type === 'PAYMENT_SUCCESS_WEBHOOK' && paymentStatus === 'SUCCESS') {
        const existingOrder = await storage.getOrderByPaymentId(orderId);
        if (existingOrder && existingOrder.status !== 'paid') {
          await storage.updateOrderStatus(existingOrder.id, 'paid', 'completed', cfPaymentId);
        }
    } else if (type === 'PAYMENT_FAILED_WEBHOOK') {
        const existingOrder = await storage.getOrderByPaymentId(orderId);
        if (existingOrder) {
          await storage.updateOrderStatus(existingOrder.id, 'failed', 'failed', cfPaymentId);
        }
    }

    res.status(200).json({ message: 'Webhook processed successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router; 