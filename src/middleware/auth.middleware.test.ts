import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './auth.middleware';

jest.mock('jsonwebtoken');

const mockRequest = (cookie?: string): Request => {
  const req: Partial<Request> = {
    cookies: {},
  };
  if (cookie) {
    req.cookies = { access_token: cookie };
  }
  return req as Request;
};

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.sendStatus = jest.fn().mockReturnThis();
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

const mockedJwtVerify = jwt.verify as jest.Mock;

describe('authenticateToken Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() and user to req if a valid cookie token is provided', () => {
    const token = 'valid-cookie-token';
    const decodedPayload = { userId: 1 };
    const req = mockRequest(token);
    const res = mockResponse();
    mockedJwtVerify.mockImplementation((t, s, cb) => cb(null, decodedPayload));

    authenticateToken(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toEqual(decodedPayload);
  });

  it('should return 401 if no token is provided', () => {
    const req = mockRequest();
    const res = mockResponse();

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid or expired', () => {
    const token = 'invalid.token';
    const req = mockRequest(token);
    const res = mockResponse();
    const jwtError = new Error('Invalid token');
    mockedJwtVerify.mockImplementation((t, s, cb) => cb(jwtError, null));

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
