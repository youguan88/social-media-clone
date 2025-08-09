import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { User } from '@prisma/client';

export const UserService = {
    async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
            },
        });
        return user;
    },
};