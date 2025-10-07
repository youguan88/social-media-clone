import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type LoginUserData = Pick<User, 'email' | 'password'>;

export const UserService = {
  async validateUniqueFields(data: {
    email: string;
    username: string;
  }): Promise<string[]> {
    const errors: string[] = [];

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUserByEmail) errors.push('email');

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUserByUsername) errors.push('username');

    return errors;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
      },
    });
    return user;
  },
  async loginUser(data: LoginUserData): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  async findUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
