import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, startApp, closeServer } from '../index'; // Adjust path as needed
import http from 'http';

describe('Product API Routes', () => {
  let server: http.Server;

  beforeAll(async () => {
    server = await startApp();
  });

  afterAll(async () => {
    await closeServer();
  });

  describe('GET /api/products', () => {
    it('should return a list of products with 200 status', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      // Optionally, add more specific checks for product structure if needed
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('variants');
        expect(response.body[0].variants).toBeInstanceOf(Array);
      }
    });
  });

  // Add more tests for specific product IDs, error cases (e.g., product not found)
  describe('GET /api/products/:id', () => {
    it('should return a single product if found', async () => {
      // Assuming product with ID 1 exists from server/storage.ts initial data
      const response = await request(app).get('/api/products/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name'); // Add more specific checks as needed
      expect(response.body).toHaveProperty('variants');
      expect(response.body.variants).toBeInstanceOf(Array);
      if (response.body.variants.length > 0) {
        expect(response.body.variants[0]).toHaveProperty('id');
        expect(response.body.variants[0]).toHaveProperty('size');
      }
    });

    it('should return 404 if product not found', async () => {
      const response = await request(app).get('/api/products/9999'); // Non-existent ID
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });
  });
}); 