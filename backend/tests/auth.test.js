import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/server.js';

describe('Auth endpoints', () => {
  it('requires payload for register', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });
});
