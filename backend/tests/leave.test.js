const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Leave = require('../models/Leave');

let mongoServer;
let employeeToken;
let managerToken;
let adminToken;
let employeeId;
let managerId;

// Setup in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Leave.deleteMany({});

  // Create admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
  });
  adminToken = adminRes.body.data.token;
  // Manually set role to admin
  await User.findByIdAndUpdate(adminRes.body.data.user._id, { role: 'admin' });

  // Create manager
  const managerRes = await request(app).post('/api/auth/register').send({
    name: 'Manager User',
    email: 'manager@test.com',
    password: 'password123',
  });
  managerToken = managerRes.body.data.token;
  managerId = managerRes.body.data.user._id;
  await User.findByIdAndUpdate(managerId, { role: 'manager' });

  // Re-login to get updated tokens with correct roles
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'password123',
  });
  adminToken = adminLogin.body.data.token;

  const managerLogin = await request(app).post('/api/auth/login').send({
    email: 'manager@test.com',
    password: 'password123',
  });
  managerToken = managerLogin.body.data.token;

  // Create employee under manager
  const empRes = await request(app).post('/api/auth/register').send({
    name: 'Employee User',
    email: 'employee@test.com',
    password: 'password123',
  });
  employeeToken = empRes.body.data.token;
  employeeId = empRes.body.data.user._id;
  await User.findByIdAndUpdate(employeeId, { manager: managerId });
});

describe('Leave Endpoints', () => {
  const leaveData = {
    leaveType: 'casual',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    reason: 'Family event',
  };

  describe('POST /api/leaves', () => {
    it('should allow employee to apply for leave', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(leaveData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.leave.leaveType).toBe('casual');
      expect(res.body.data.leave.status).toBe('pending');
    });

    it('should reject leave without authentication', async () => {
      const res = await request(app).post('/api/leaves').send(leaveData);

      expect(res.statusCode).toBe(401);
    });

    it('should reject leave with invalid leave type', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ ...leaveData, leaveType: 'invalid' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject admin from applying leave', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(leaveData);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/leaves/my', () => {
    it('should return employee leave history', async () => {
      // Apply for a leave first
      await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(leaveData);

      const res = await request(app)
        .get('/api/leaves/my')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.leaves).toHaveLength(1);
      expect(res.body.data.pagination).toBeDefined();
    });
  });

  describe('PATCH /api/leaves/:id/cancel', () => {
    it('should allow employee to cancel pending leave', async () => {
      const applyRes = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(leaveData);

      const leaveId = applyRes.body.data.leave._id;

      const res = await request(app)
        .patch(`/api/leaves/${leaveId}/cancel`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.leave.status).toBe('cancelled');
    });
  });

  describe('PATCH /api/leaves/:id/review', () => {
    it('should allow manager to approve leave', async () => {
      const applyRes = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(leaveData);

      const leaveId = applyRes.body.data.leave._id;

      const res = await request(app)
        .patch(`/api/leaves/${leaveId}/review`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: 'approved', reviewComment: 'Enjoy your time off!' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.leave.status).toBe('approved');
    });

    it('should not allow employee to review leave', async () => {
      const applyRes = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(leaveData);

      const leaveId = applyRes.body.data.leave._id;

      const res = await request(app)
        .patch(`/api/leaves/${leaveId}/review`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ status: 'approved' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/leaves/stats', () => {
    it('should return leave statistics', async () => {
      const res = await request(app)
        .get('/api/leaves/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.statusStats).toBeDefined();
      expect(res.body.data.typeStats).toBeDefined();
    });
  });
});
