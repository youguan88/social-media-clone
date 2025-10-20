import { Request, Response, NextFunction } from 'express';
import { csrfProtection } from './csrf.middleware';

const mockRequest = (cookie?: string, header?: string): Request => {
  const req: Partial<Request> = {
    cookies: {},
    headers: {},
  };
  if (cookie) {
    req.cookies = { csrf_token: cookie };
  }
  if (header) {
    req.headers = { 'x-csrf-token': header };
  }
  return req as Request;
};

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('CSRF Protection Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call next() if the cookie and header tokens match', () => {
    const token = 'valid-token-123';
    const req = mockRequest(token, token);
    const res = mockResponse();

    csrfProtection(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 403 forbidden if the header is missing', () => {
    const token = 'valid-token-123';
    const req = mockRequest(token, undefined);
    const res = mockResponse();

    csrfProtection(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 forbidden if the cookie is missing', () => {
    const token = 'valid-token-123';
    const req = mockRequest(undefined, token);
    const res = mockResponse();

    csrfProtection(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 forbidden if the tokens do not match', () => {
    const req = mockRequest('token-from-cookie', 'token-from-header');
    const res = mockResponse();

    csrfProtection(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
