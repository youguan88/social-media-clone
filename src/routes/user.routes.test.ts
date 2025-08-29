import request from 'supertest';
import app from '../index';
import {
  UserService,
  CreateUserData,
  LoginUserData,
} from '../services/user.service';
import {
  LoginUserSuccessReturn,
  CreateUserSuccessReturn,
} from '../types/user.types';

jest.mock('../services/user.service');
const mockedUserService = UserService as jest.Mocked<typeof UserService>;

describe('User Routes', () => {
  describe('POST /register', () => {
    it('should call the UserService.createUser and return a 201 status', async () => {
      const userInput: CreateUserData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedUser: CreateUserSuccessReturn = {
        id: 1,
        email: userInput.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedUserService.createUser.mockResolvedValue(expectedUser);
      const response = await request(app)
        .post('/api/users/register')
        .send(userInput);

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(userInput.email);
      expect(response.body).not.toHaveProperty('password');
      expect(UserService.createUser).toHaveBeenCalledWith(userInput);
    });
  });
  describe('POST /login', () => {
    it('should call the UserService.loginUser and return a 200 status with a token', async () => {
      const loginInput: LoginUserData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult: LoginUserSuccessReturn = {
        user: {
          id: 1,
          email: loginInput.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'fake-jwt-token',
      };
      mockedUserService.loginUser.mockResolvedValue(expectedResult);

      const response = await request(app)
        .post('/api/users/login')
        .send(loginInput);

      expect(response.status).toBe(200);
      expect(response.body.token).toBe(expectedResult.token);
      expect(response.body.user.email).toBe(loginInput.email);
    });
  });
});
