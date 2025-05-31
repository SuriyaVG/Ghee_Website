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

// Handle Cashfree webhooks
router.post('/cashfree-webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receivedSignature = req.body.signature;
    const payload = { ...req.body };
    delete payload.signature;
    if (!receivedSignature) {
      const err: any = new Error('Missing signature in webhook payload.');
      err.statusCode = 400;
      return next(err);
    }
    const crypto = await import('node:crypto');
    const sortedKeys = Object.keys(payload).sort();
    let toSign = '';
    for (const key of sortedKeys) {
      if (payload[key] != null) toSign += payload[key].toString();
    }
    const hmac = crypto.createHmac('sha256', process.env.CASHFREE_SECRET_KEY!);
    hmac.update(toSign);
    const computedSignature = hmac.digest('base64');
    if (computedSignature !== receivedSignature) {
      const err: any = new Error('Invalid webhook signature.');
      err.statusCode = 401;
      return next(err);
    }
    const { order_id, cf_payment_id, order_status } = req.body;
    if (order_id && order_status) {
      const existing = await storage.getOrderByPaymentId(order_id);
      if (existing) {
        let newStatus = existing.status;
        let newPaymentStatus = existing.paymentStatus;
        if (order_status === 'PAID') {
          newStatus = 'paid'; newPaymentStatus = 'completed';
        } else if (['FAILED','USER_DROPPED'].includes(order_status)) {
          newStatus = 'failed'; newPaymentStatus = 'failed';
        } else if (order_status === 'PENDING') {
          newPaymentStatus = 'pending_webhook';
        }
        if (newStatus !== existing.status || newPaymentStatus !== existing.paymentStatus) {
          await storage.updateOrderStatus(existing.id, newStatus, newPaymentStatus, cf_payment_id);
        }
      }
    }
    res.status(200).json({ message: 'Webhook processed.' });
  } catch (error) {
    next(error);
  }
});

export default router; 