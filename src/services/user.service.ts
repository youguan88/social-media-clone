import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { JwtPayload } from '../types/user.types';
import { jwtConfig } from '../config';

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
  async loginUser(
    data: LoginUserData,
  ): Promise<{ user: Omit<User, 'password'>; token: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) return null;

    const payload: JwtPayload = {
      userId: user.id,
    };

    const token = jwt.sign(payload, jwtConfig.secret, jwtConfig.options);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },
};
