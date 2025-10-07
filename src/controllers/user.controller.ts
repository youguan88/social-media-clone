import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/user.types';
import { jwtConfig } from '../config';
import crypto from 'crypto';
import { error } from 'console';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: 'Email, username, and password are required.' });
    }

    const validationErrors = await UserService.validateUniqueFields({
      email,
      username,
    });
    if (validationErrors.length > 0) {
      return res.status(409).json({
        message: 'Validation failed.',
        errors: validationErrors.map((field) => ({
          field,
          message: `An account with this ${field} already exists.`,
        })),
      });
    }

    const newUser = await UserService.createUser({ email, username, password });
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error: any) {
    //fallback
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      return res
        .status(409)
        .json({
          message:
            'An account with this' + target.join(' and ') + 'already exists.',
        });
    }
    res.status(500).json({ message: 'An error occured during registration.' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    const user = await UserService.loginUser({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials.' });
    }

    const payload: JwtPayload = {
      userId: user.id,
    };
    const token = jwt.sign(payload, jwtConfig.secret, jwtConfig.options);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    const csrfToken = crypto.randomBytes(16).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res.status(200).json({ user, csrfToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occured during login.' });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await UserService.findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user });
};

export const getCsrfToken = (req: Request, res: Response) => {
  const csrfToken = crypto.randomBytes(16).toString('hex');
  res.cookie('csrf_token', csrfToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000,
  });
  res.json({ csrfToken });
};
