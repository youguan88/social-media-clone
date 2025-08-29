import 'dotenv/config';
import { Secret, SignOptions } from 'jsonwebtoken';

export const jwtConfig = {
  secret: process.env.JWT_SECRET as Secret,
  options: {
    expiresIn: '1h',
  } as SignOptions,
};
