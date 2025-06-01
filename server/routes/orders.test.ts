import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, startApp, closeServer } from '../index';
import http from 'http';
import { InsertOrder } from '@shared/schema';

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

    const validOrderData: InsertOrder = {
      customerName: 'Test Customer',
      customerEmail: 'testcustomer@example.com',
      customerPhone: '+919876543210',
      items: mockItemsString, // Items as a JSON string directly
      total: '500.00',
      // status, paymentId, paymentStatus, razorpayOrderId are optional or have defaults
    };

    it('should create an order with valid data and return 201 status', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.customerName).toBe(validOrderData.customerName);
      expect(response.body.total).toBe(validOrderData.total);
      expect(response.body.status).toBe('pending'); // Default status
    });

    it('should return 400 if customerName is missing', async () => {
      const { customerName, ...invalidData } = validOrderData;
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('customerName');
    });

    it('should return 400 if items are missing', async () => {
      const { items, ...invalidData } = validOrderData;
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      expect(response.status).toBe(400);
       expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('items');
    });

    it('should return 400 if total is missing', async () => {
      const { total, ...invalidData } = validOrderData;
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('total');
    });

    it('should return 400 if total is not a valid decimal string', async () => {
      const invalidData = { ...validOrderData, total: 'not-a-number' };
      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      const totalError = response.body.errors.find((err: any) => err.path === 'total');
      expect(totalError).toBeDefined();
    });
  });
}); 