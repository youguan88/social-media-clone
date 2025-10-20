import { Prisma, User } from '@prisma/client';
import { CreateUserData, LoginUserData, UserService } from './user.service';
import { prismaMock } from '../test-setup/singleton';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  CreateUserSuccessReturn,
  JwtPayload,
  LoginUserSuccessReturn,
} from '../types/user.types';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserService', () => {
  describe('validateUniqueFields', () => {
    it('should return an empty array if email and username are unique', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const errors = await UserService.validateUniqueFields({
        email: 'new@email.com',
        username: 'newUser',
      });
      expect(errors).toEqual([]);
    });
    it('should return an array with "email" if email is a duplicate', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({} as User)
        .mockResolvedValueOnce(null);
      const errors = await UserService.validateUniqueFields({
        email: 'new@email.com',
        username: 'newUser',
      });
      expect(errors).toEqual(['email']);
    });
    it('should return an array with "username" if username is a duplicate', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({} as User);
      const errors = await UserService.validateUniqueFields({
        email: 'new@email.com',
        username: 'newUser',
      });
      expect(errors).toEqual(['username']);
    });
    it('should return an array with both fields if both are duplicates', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({} as User)
        .mockResolvedValueOnce({} as User);
      const errors = await UserService.validateUniqueFields({
        email: 'new@email.com',
        username: 'newUser',
      });
      expect(errors).toEqual(['email', 'username']);
    });
  });
  describe('createUser', () => {
    it('should hash the password and create a new user', async () => {
      const userInput: CreateUserData = {
        email: 'test@example.com',
        username: 'test',
        password: 'password123',
      };
      const expectedHashedPassword = 'hashedpassword123';
      const expectedCreateArgs: Prisma.UserCreateArgs = {
        data: {
          email: userInput.email,
          username: userInput.username,
          password: expectedHashedPassword,
        },
      };
      const expectedUser: CreateUserSuccessReturn = {
        id: 1,
        username: userInput.username,
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
      username: 'test',
      email: loginInput.email,
      password: 'storedHashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user and token on successful login', async () => {
      const expectedResult: LoginUserSuccessReturn = {
        id: storedUser.id,
        username: storedUser.username,
        email: loginInput.email,
        createdAt: storedUser.createdAt,
        updatedAt: storedUser.updatedAt,
      };
      const expectedPayload: JwtPayload = {
        userId: storedUser.id,
      };

      prismaMock.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

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
  describe('followUser', () => {
    it('should call prisma.user.update with a connect action', async () => {
      await UserService.followUser(1, 2);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { following: { connect: { id: 2 } } },
      });
    });
  });
  describe('unfollowUser', () => {
    it('should call prisma.user.update with a disconnect action', async () => {
      await UserService.unfollowUser(1, 2);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { following: { disconnect: { id: 2 } } },
      });
    });
  });
  describe('getUserProfile', () => {
    it('should return isFollowing: False for a logged-out viewer', async () => {
      const mockProfile = {
        id: 2,
        username: 'jane',
        _count: { followers: 10, following: 5 },
      };
      prismaMock.user.findUnique.mockResolvedValue(mockProfile as any);

      const profile = await UserService.getUserProfile('jane', undefined);

      expect(profile).toHaveProperty('username', 'jane');
      expect(profile?.isFollowing).toBe(false);
    });
    it('should return isFollowing: True for a viewer who is following', async () => {
      const mockProfile = {
        id: 2,
        username: 'jane',
        _count: { followers: 10, following: 5 },
      };
      prismaMock.user.findUnique.mockResolvedValue(mockProfile as any);
      prismaMock.user.findFirst.mockResolvedValue({} as User);

      const profile = await UserService.getUserProfile('jane', 1);

      expect(profile).toHaveProperty('isFollowing', true);
    });
  });
  describe('findUserById', () => {
    it('should return a user object without the password if the user is found', async () => {
      const dbUser: User = {
        id: 1,
        email: 'email@email.com',
        username: 'user',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.user.findUnique.mockResolvedValue(dbUser);

      const result = await UserService.findUserById(dbUser.id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: dbUser.id },
      });
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('password');
      expect(result?.id).toBe(dbUser.id);
    });
    it('should return null if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const fakeId = 999;
      const result = await UserService.findUserById(fakeId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: fakeId,
        },
      });
      expect(result).toBeNull();
    });
  });
});
