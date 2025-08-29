import { Prisma } from '@prisma/client';
import { CreateUserData, LoginUserData, UserService } from './user.service';
import { prismaMock } from '../test-setup/singleton';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  CreateUserSuccessReturn,
  JwtPayload,
  LoginUserSuccessReturn,
} from '../types/user.types';
import { jwtConfig } from '../config';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserService', () => {
  describe('createUser', () => {
    it('should hash the password and create a new user', async () => {
      const userInput: CreateUserData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedHashedPassword = 'hashedpassword123';
      const expectedCreateArgs: Prisma.UserCreateArgs = {
        data: {
          email: userInput.email,
          password: expectedHashedPassword,
        },
      };
      const expectedUser: CreateUserSuccessReturn = {
        id: 1,
        email: userInput.email,
        password: expectedHashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue(expectedHashedPassword);
      prismaMock.user.create.mockResolvedValue(expectedUser);

      const result = await UserService.createUser(userInput);

      expect(result).toEqual(expectedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(userInput.password, 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith(expectedCreateArgs);
    });
  });
  describe('loginUser', () => {
    const loginInput: LoginUserData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const storedUser: CreateUserSuccessReturn = {
      id: 1,
      email: loginInput.email,
      password: 'storedHashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user and token on successful login', async () => {
      const expectedResult: LoginUserSuccessReturn = {
        user: {
          id: storedUser.id,
          email: loginInput.email,
          createdAt: storedUser.createdAt,
          updatedAt: storedUser.updatedAt,
        },
        token: 'fake-jwt-token',
      };
      const expectedPayload: JwtPayload = {
        userId: storedUser.id,
      };

      prismaMock.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(expectedResult.token);

      const result = await UserService.loginUser(loginInput);
      expect(result).toEqual(expectedResult);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginInput.email,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        storedUser.password,
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        expectedPayload,
        jwtConfig.secret,
        jwtConfig.options,
      );
    });

    it('should return null if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const result = await UserService.loginUser(loginInput);
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await UserService.loginUser(loginInput);
      expect(result).toBeNull();
      expect(jwt.sign as jest.Mock).not.toHaveBeenCalled();
    });
  });
});
