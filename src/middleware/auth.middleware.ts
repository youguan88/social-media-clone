import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/user.types';

//Extend to allow req.user in type-safe way
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies['access_token'];
  //check null and undefined
  if (token == null) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: No token provided.' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Invalid or expired token.' });
    }
    req.user = user as JwtPayload;
    next();
  });
};
