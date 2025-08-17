import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export const UserService = {
  async createUser(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
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
    data: Pick<User, 'email' | 'password'>,
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },
};
