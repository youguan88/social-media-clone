import request from 'supertest';
import app from './index';
import { prismaMock } from './test-setup/singleton';

describe('GET / The root endpoint', () => {
  it('should respond with a 200 status code and the correct message', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello World! Your sever is running.');
  });
});

describe('GET /api/health', () => {
  it('should respond with a JSON object containing a status property', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('GET /api/me (Protected Route)', () => {
  it('should return a 401 Unauthorized error if no token is provided', async () => {
    const response = await request(app).get('/api/me');
    expect(response.statusCode).toBe(401);
  });

  it('should return a 403 Forbidden error if the token is invalid or expired', async () => {
    const invalidToken = 'this.is.an.invalid.token';
    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${invalidToken}`);
    expect(response.statusCode).toBe(403);
  });
});
