import type { Express, Request, Response, NextFunction } from 'express';
import { type AnyZodObject } from 'zod';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { insertOrderSchema, insertContactSchema } from '@shared/schema';
import axios from 'axios';

// Validation Middleware
const validateRequest =
  (schema: AnyZodObject, property: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Zod's parse/parseAsync returns the validated data.
      // It's common to replace the original req property with the validated (and potentially transformed) data.
      req[property] = await schema.parseAsync(req[property]);
      next();
    } catch (error) {
      next(error); // ZodError will be caught by the centralized error handler
    }
  };

export async function registerRoutes(app: Express): Promise<Server> {
  // Check for required Cashfree environment variables
  if (
    !process.env.CASHFREE_APP_ID ||
    !process.env.CASHFREE_SECRET_KEY ||
    !process.env.CASHFREE_ENV
  ) {
    console.error(
      'FATAL ERROR: Cashfree environment variables (CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV) are not set. Please configure them in your .env file.'
    );
    // For a real app, you might exit or throw a more specific startup error
    // Throwing a generic error here will be caught by the centralized handler if routes are called before .env is fixed
    throw new Error(
      'Server configuration error: Missing required Cashfree credentials or environment setting.'
    );
  }

  const cashfreeConfig = {
    appId: process.env.CASHFREE_APP_ID, // No fallback
    secretKey: process.env.CASHFREE_SECRET_KEY, // No fallback
    // Determine baseUrl based on CASHFREE_ENV. Default to sandbox if invalid or not explicitly production.
    baseUrl:
      process.env.CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com'
        : 'https://sandbox.cashfree.com', // Default to sandbox for safety if misconfigured
  };

  console.log(
    `Cashfree Integration: Mode: ${process.env.CASHFREE_ENV}, BaseURL: ${cashfreeConfig.baseUrl}, AppID: ${cashfreeConfig.appId ? 'Loaded' : 'MISSING!'}`
  );

  // Get all products
  app.get('/api/products', async (req, res, next) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  // Get single product
  app.get('/api/products/:id', async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);

      if (!product) {
        const err: any = new Error('Product not found');
        err.statusCode = 404;
        return next(err);
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Create order
  app.post('/api/orders', validateRequest(insertOrderSchema), async (req, res, next) => {
    try {
      // req.body is now validated and potentially transformed by insertOrderSchema
      const order = await storage.createOrder(req.body); // Use req.body directly
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  // Get order
  app.get('/api/orders/:id', async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        const err: any = new Error('Order not found');
        err.statusCode = 404;
        return next(err);
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Create Cashfree order
  app.post('/api/create-cashfree-order', async (req, res, next) => {
    try {
      const { amount, currency = 'INR', customerInfo } = req.body;

      if (
        !amount ||
        !customerInfo ||
        !customerInfo.customerName ||
        !customerInfo.customerEmail ||
        !customerInfo.customerPhone
      ) {
        const err: any = new Error('Missing amount or customer information for Cashfree order.');
        err.statusCode = 400;
        return next(err);
      }

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

      const response = await axios.post(`${cashfreeConfig.baseUrl}/pg/orders`, orderData, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': cashfreeConfig.appId,
          'x-client-secret': cashfreeConfig.secretKey,
          'Content-Type': 'application/json',
        },
      });

      res.json({
        orderId: response.data.order_id,
        paymentSessionId: response.data.payment_session_id,
        amount: response.data.order_amount,
        currency: response.data.order_currency,
      });
    } catch (error) {
      console.error('Cashfree order creation failed in route handler:', error);
      next(error);
    }
  });

  // Verify Cashfree payment & Create Order in DB
  app.post('/api/verify-cashfree-payment', async (req, res, next) => {
    try {
      const {
        cashfreeOrderId, // This is the order_id you generated (e.g., order_timestamp)
        cfPaymentId, // Actual payment ID from Cashfree if available from redirect
        customerInfo, // { customerName, customerEmail, customerPhone }
        items, // Array of cart items
        total, // Order total amount
      } = req.body;

      if (!cashfreeOrderId || !customerInfo || !items || total === undefined) {
        const err: any = new Error('Missing required fields for verification.');
        err.statusCode = 400;
        return next(err);
      }

      const cashfreeOrderDetailsResponse = await axios.get(
        `${cashfreeConfig.baseUrl}/pg/orders/${cashfreeOrderId}`,
        {
          headers: {
            'x-api-version': '2022-09-01', // Ensure this is the latest or correct version
            'x-client-id': cashfreeConfig.appId,
            'x-client-secret': cashfreeConfig.secretKey,
          },
        }
      );

      const cfOrderData = cashfreeOrderDetailsResponse.data;

      // 1. Verify Payment Status
      if (cfOrderData.order_status !== 'PAID') {
        const err: any = new Error(`Payment not successful. Status: ${cfOrderData.order_status}`);
        err.statusCode = 400;
        err.details = { orderStatus: cfOrderData.order_status };
        return next(err);
      }

      // 2. Verify Amount (crucial security check)
      // Cashfree amounts are in paisa if not specified, ensure consistency or convert.
      // Assuming your 'total' is in the base currency unit (e.g., Rupees)
      // and Cashfree's order_amount is also in the base currency unit.
      // If Cashfree returns paisa, and your total is rupees, you must convert for comparison.
      // For now, assuming they are in the same unit as per your create-cashfree-order logic.
      if (parseFloat(cfOrderData.order_amount) !== parseFloat(total)) {
        console.warn('Amount mismatch during verification!', {
          cfAmount: cfOrderData.order_amount,
          clientTotal: total,
          cashfreeOrderId,
        });
        const err: any = new Error('Payment amount mismatch. Potential tampering or error.');
        err.statusCode = 400;
        err.details = { orderStatus: cfOrderData.order_status };
        return next(err);
      }

      // 3. If all checks pass, create the order in your database
      const orderToCreate = {
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        customerPhone: customerInfo.customerPhone,
        items: JSON.stringify(items), // Assuming schema expects a JSON string
        total: total.toString(), // Assuming schema expects a string
        status: 'paid', // or 'confirmed', 'processing' as per your system
        paymentId: cfOrderData.cf_order_id, // Cashfree's main order ID for this transaction
        paymentStatus: 'completed', // or cfOrderData.order_status
        // Add cashfreeOrderId if you want to store the ID you sent to cashfree
        // razorpayOrderId: cashfreeOrderId, // If you were using this field for your internal cashfree order id
      };

      // Validate with Zod schema before db insertion
      const validatedData = insertOrderSchema.parse(orderToCreate);
      const newOrder = await storage.createOrder(validatedData);

      res.status(201).json({
        success: true,
        message: 'Payment verified and order created successfully.',
        order: newOrder,
      });
    } catch (error) {
      console.error(
        'Cashfree payment verification and order creation failed in route handler:',
        error
      );
      next(error);
    }
  });

  // Create contact
  app.post('/api/contacts', validateRequest(insertContactSchema), async (req, res, next) => {
    try {
      // req.body is now validated and potentially transformed by insertContactSchema
      const contact = await storage.createContact(req.body); // Use req.body directly
      res.status(201).json(contact);
    } catch (error) {
      next(error);
    }
  });

  // Cashfree Webhook Handler
  app.post('/api/cashfree-webhook', async (req, res, next) => {
    const receivedSignature = req.body.signature; // Assuming signature is in the body
    const webhookPayload = { ...req.body };
    delete webhookPayload.signature; // Remove signature from payload for verification string

    if (!receivedSignature) {
      console.warn('Cashfree Webhook: Missing signature.');
      const err: any = new Error('Missing signature in webhook payload.');
      err.statusCode = 400;
      return next(err);
    }

    try {
      const crypto = await import('node:crypto');

      // 1. Sort the payload by keys
      const sortedKeys = Object.keys(webhookPayload).sort();

      // 2. Concatenate all the values in the sorted order
      let payloadToSign = '';
      for (const key of sortedKeys) {
        // Cashfree docs: "Concatenate all the values in this array"
        // Ensure values are consistently stringified if they are objects/arrays, though typically webhook payloads are flat or consistently structured.
        // The example showed simple key=value pairs where values were strings or numbers.
        // If a value is null or undefined, Cashfree might omit it or send it as empty string. Test this.
        // For now, directly concatenating values as strings.
        if (webhookPayload[key] !== null && webhookPayload[key] !== undefined) {
          payloadToSign += webhookPayload[key].toString();
        }
      }

      // 3. Create HMAC SHA256 hash
      const hmac = crypto.createHmac('sha256', cashfreeConfig.secretKey);
      hmac.update(payloadToSign);
      const computedSignature = hmac.digest('base64');

      // 4. Compare signatures
      if (computedSignature === receivedSignature) {
        console.log('Cashfree Webhook: Signature verified.');
        // Process the event
        const { order_id, cf_payment_id, order_status, event_type /* and other fields */ } =
          req.body;

        // Example: Update order status based on webhook
        // The 'order_id' from webhook is the one generated by create-cashfree-order (e.g. order_timestamp)
        // This was stored as 'paymentId' in our orders table during verify-cashfree-payment.
        if (order_id && order_status) {
          const existingOrder = await storage.getOrderByPaymentId(order_id);

          if (existingOrder) {
            let newDbStatus = existingOrder.status;
            let newDbPaymentStatus = existingOrder.paymentStatus;

            // Map Cashfree status to your internal status
            // This is a critical part: map Cashfree event types and statuses to your DB statuses.
            // Example mapping:
            if (order_status === 'PAID') {
              newDbStatus = 'paid';
              newDbPaymentStatus = 'completed';
            } else if (order_status === 'FAILED' || order_status === 'USER_DROPPED') {
              newDbStatus = 'failed';
              newDbPaymentStatus = 'failed';
            } else if (order_status === 'PENDING') {
              // Potentially map to a pending state if you want to track it
              newDbPaymentStatus = 'pending_webhook';
            }
            // Add more mappings based on Cashfree event types and statuses

            // Idempotency: Only update if status has changed
            if (
              newDbStatus !== existingOrder.status ||
              newDbPaymentStatus !== existingOrder.paymentStatus
            ) {
              await storage.updateOrderStatus(
                existingOrder.id,
                newDbStatus,
                newDbPaymentStatus,
                cf_payment_id /* Cashfree's specific payment ID from webhook */
              );
              console.log(
                `Cashfree Webhook: Order ${existingOrder.id} (Cashfree Order ID: ${order_id}) status updated to ${newDbStatus}, paymentStatus ${newDbPaymentStatus}`
              );
            } else {
              console.log(
                `Cashfree Webhook: Order ${existingOrder.id} (Cashfree Order ID: ${order_id}) status already ${newDbStatus}. No update needed.`
              );
            }
          } else {
            console.warn(`Cashfree Webhook: Order not found for Cashfree Order ID: ${order_id}`);
          }
        }

        res.status(200).json({ message: 'Webhook received and processed.' });
      } else {
        console.warn('Cashfree Webhook: Signature mismatch.');
        const err: any = new Error('Invalid webhook signature.');
        err.statusCode = 401;
        next(err);
      }
    } catch (error: any) {
      console.error('Cashfree Webhook: Error processing webhook:', error);
      const processingError: any = new Error('Error processing webhook data.');
      processingError.statusCode = 500;
      processingError.cause = error;
      next(processingError);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
