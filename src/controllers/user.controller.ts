import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

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
    const result = await UserService.loginUser({ email, password });
    if (!result) {
      return res.status(401).json({ message: 'Invalid Credentials.' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occured during login.' });
  }
};
