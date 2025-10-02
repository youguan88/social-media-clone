import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/user.types';
import { jwtConfig } from '../config';
import crypto from 'crypto';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }
    const newUser = await UserService.createUser({ email, password });
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists.' });
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
