import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, startApp, closeServer } from '../index';
import http from 'http';
import { insertOrderSchema } from '../../shared/schema';
import { InsertOrder } from '../../shared/schemas/orders';

describe('Order API Routes', () => {
  let server: http.Server;

  beforeAll(async () => {
    server = await startApp();
  });

  afterAll(async () => {
    await closeServer();
  });

  describe('POST /api/orders', () => {
    const mockItemsString = JSON.stringify([
      {
        productId: 'prod_1', // Example data, structure depends on client-server contract
        variantId: 'var_A',
        name: 'Pure Ghee - 250ml',
        quantity: 1,
        price: 500,
        size: '250ml',
        image_url: '/images/ghee-250ml.jpg'
      },
    ]);

    const validOrderData: InsertOrder & { items: any[] } = {
      customerName: 'Test Customer',
      customerEmail: 'testcustomer@example.com',
      customerPhone: '+91 9876543210',
      items: [
        {
          productId: 1,
          name: 'Pure Ghee - 250ml',
          quantity: 2,
          price: '170.00',
        },
      ],
      total: '340.00',
      status: 'pending',
      paymentStatus: 'pending',
    };

    it('should create an order with valid data and return 201 status', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.customerName).toBe(validOrderData.customerName);
      expect(response.body.total).toBe(validOrderData.total);
      expect(response.body.status).toBe('pending');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].product_name).toBe('Pure Ghee - 250ml');
      expect(response.body.items[0].quantity).toBe(2);
    });

    it('should return 400 if customerName is missing', async () => {
      const { customerName, ...invalidData } = validOrderData;
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      console.log('Response body (customerName missing):', response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors[0].path).toBe('customerName');
    });

    it('should return 400 if items are missing', async () => {
      const { items, ...invalidData } = validOrderData;
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      console.log('Response body (items missing):', response.body);
      expect(response.status).toBe(400);
       expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('items');
    });

    it('should return 400 if total is missing', async () => {
      const { total, ...invalidData } = validOrderData;
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      console.log('Response body (total missing):', response.body);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('total');
    });

    it('should return 400 if total is not a valid decimal string', async () => {
      const invalidData = { ...validOrderData, total: 'not-a-number' };
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      console.log('Response body (total not a number):', response.body);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      const totalError = response.body.errors.find((err: any) => err.path === 'total');
      expect(totalError).toBeDefined();
    });

    it('should return orders with items array for GET /api/orders', async () => {
      // Create an order first
      await request(app).post('/api/orders').send(validOrderData);
      // Fetch orders as admin
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${process.env.ADMIN_API_TOKEN}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(Array.isArray(response.body[0].items)).toBe(true);
        expect(response.body[0].items[0]).toHaveProperty('product_name');
        expect(response.body[0].items[0]).toHaveProperty('quantity');
      }
    });
  });
}); 