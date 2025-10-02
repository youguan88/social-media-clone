import { Request, Response, NextFunction } from 'express';

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const csrfTokenFromCookie = req.cookies.csrf_token;
  const csrfTokenFromHeader = req.headers['x-csrf-token'];

  if (!csrfTokenFromCookie || !csrfTokenFromHeader) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }

  if (csrfTokenFromCookie !== csrfTokenFromHeader) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};
