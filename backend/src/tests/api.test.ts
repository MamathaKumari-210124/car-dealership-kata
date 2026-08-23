/// <reference types="jest" />
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let userToken: string;
let adminToken: string;
let vehicleId: string;

beforeAll(async () => {
  // Wipe test records to ensure clean state
  await prisma.transaction.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Car Dealership System API', () => {
  it('should register a standard user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@test.com',
        password: 'password123',
        role: 'USER'
      });
    expect(res.status).toBe(201);
  });

  it('should register an admin user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN'
      });
    expect(res.status).toBe(201);
  });

  it('should log in standard user and receive token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'password123'
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  it('should log in admin user and receive token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  it('should create a new vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Tesla',
        model: 'Model 3',
        category: 'Electric',
        price: 45000,
        quantity: 2
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    vehicleId = res.body.id;
  });

  it('should purchase a vehicle and reduce quantity', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(1);
    expect(res.body.transaction).toBeDefined();
  });

  it('should deny vehicle deletion from standard user', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow vehicle deletion from admin', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});