import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, startApp, closeServer } from '../index';
import http from 'http';
import { InsertContact } from '../../shared/schemas/contacts';

describe('Contact API Routes', () => {
  let server: http.Server;

  beforeAll(async () => {
    server = await startApp();
  });

  afterAll(async () => {
    await closeServer();
  });

  describe('POST /api/contacts', () => {
    const validContactData: InsertContact = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      message: 'This is a test message.',
      phone: '+1234567890' // Optional, but valid if provided
    };

    it('should create a contact with valid data and return 201 status', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(validContactData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(validContactData.firstName);
      expect(response.body.email).toBe(validContactData.email);
    });

    it('should return 400 if firstName is missing', async () => {
      const { firstName, ...invalidData } = validContactData;
      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('firstName');
    });

    it('should return 400 if email is invalid', async () => {
      const invalidData = { ...validContactData, email: 'not-an-email' };
      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors[0].path).toBe('email');
    });

    it('should return 400 if phone number is invalid (and provided)', async () => {
      const invalidData = { ...validContactData, phone: 'invalid-phone-number' };
      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('phone');
      expect(response.body.errors[0].message).toBe('Phone number must be valid or empty.');
    });

    it('should accept submission if phone number is empty or undefined', async () => {
      const { phone, ...dataWithoutPhone } = validContactData;
      const response1 = await request(app)
        .post('/api/contacts')
        .send(dataWithoutPhone);
      expect(response1.status).toBe(201);

      const dataWithEmptyPhone = { ...validContactData, phone: '' };
      const response2 = await request(app)
        .post('/api/contacts')
        .send(dataWithEmptyPhone);
      expect(response2.status).toBe(201);
    });

     it('should return 400 if message is missing', async () => {
      const { message, ...invalidData } = validContactData;
      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].path).toBe('message');
    });
  });
}); 