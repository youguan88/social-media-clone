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

describe('POST /api/users/register', () => {
  it('should create a new user and return it without the password', async () => {
    const newUser = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    //mock created object
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email: newUser.email,
      password: 'somehashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/users/register')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(newUser.email);
    expect(response.body).toHaveProperty('id');
    expect(response.body).not.toHaveProperty('password');
  });

  it('should return a 409 conflict error if the email already exists', async () => {
    const duplicateUser = {
      email: 'duplicate@example.com',
      password: 'password123',
    };

    prismaMock.user.create.mockRejectedValue({ code: 'P2002' });

    const response = await request(app)
      .post('/api/users/register')
      .send(duplicateUser);

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already exists');
  });
});
