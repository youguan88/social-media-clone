import { UserService } from './user.service';
import { prismaMock } from '../test-setup/singleton';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const mockedBcryptCompare = bcrypt.compare as jest.Mock;
const mockedJwtSign = jwt.sign as jest.Mock;

describe('UserService.loginUser', () => {
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const plainPassword = 'password123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user and token on successful login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    mockedBcryptCompare.mockResolvedValue(true);
    mockedJwtSign.mockReturnValue('mocked.jwt.token');
    const result = await UserService.loginUser({
      email: mockUser.email,
      password: plainPassword,
    });
    expect(result).not.toBeNull();
    expect(result?.user.email).toBe(mockUser.email);
    expect(result?.token).toBe('mocked.jwt.token');
    expect(result?.user).not.toHaveProperty('password');
  });

  it('should return null if user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await UserService.loginUser({
      email: 'nouser@example.com',
      password: plainPassword,
    });
    expect(result).toBeNull();
    expect(mockedBcryptCompare).not.toHaveBeenCalled();
  });

  it('should return null if password is invalid', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    mockedBcryptCompare.mockResolvedValue(false);
    const result = await UserService.loginUser({
      email: mockUser.email,
      password: 'wrongpassword',
    });
    expect(result).toBeNull();
  });
});
