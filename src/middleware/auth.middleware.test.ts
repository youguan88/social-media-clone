import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './auth.middleware';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const mockedJwtVerify = jwt.verify as jest.Mock;

describe('authenticateToken Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockImplementation(() => {
        return mockResponse as Response;
      }),
      sendStatus: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should call next() if token is valid', () => {
    const token = 'valid.token';
    const decodedPayload = { userId: 1 };
    mockRequest.headers = { authorization: `Bearer ${token}` };
    //jwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... });
    mockedJwtVerify.mockImplementation((t, s, cb) => cb(null, decodedPayload));

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toEqual(decodedPayload);
  });

  it('should return 401 if no token is provided', () => {
    mockRequest.headers = { authorization: undefined };

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    const token = 'invalid.token';
    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockedJwtVerify.mockImplementation((t, s, cb) =>
      cb(new Error('Invalid token'), null),
    );

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
