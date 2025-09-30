import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type LoginUserData = Pick<User, 'email' | 'password'>;

export const UserService = {
  async createUser(data: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
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
};
