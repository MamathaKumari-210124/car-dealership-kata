import request from 'supertest';
import app from '../app';

describe('Car Dealership System API', () => {
  let userToken: string;
  let adminToken: string;
  let vehicleId: string;

  it('should register a standard user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'user@test.com',
      password: 'password123',
      role: 'USER'
    });
    expect(res.status).toBe(201);
  });

  it('should register an admin user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN'
    });
    expect(res.status).toBe(201);
  });

  it('should log in standard user and receive token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  it('should log in admin user and receive token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password123'
    });
    expect(res.status).toBe(200);
    adminToken = res.body.token;
  });

  it('should create a new vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        make: 'Tesla',
        model: 'Model 3',
        category: 'Sedan',
        price: 35000,
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
    expect(res.body.quantity).toBe(1);
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