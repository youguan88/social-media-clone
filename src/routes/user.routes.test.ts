import request from 'supertest';
import app from '../index';
import {
  UserService,
  CreateUserData,
  LoginUserData,
} from '../services/user.service';
import {
  LoginUserSuccessReturn,
  CreateUserSuccessReturn,
  UserProfileSuccessReturn,
} from '../types/user.types';
import { authenticateToken } from '../middleware/auth.middleware';
import { csrfProtection } from '../middleware/csrf.middleware';
import { createPath, paths } from '../constants';

jest.mock('../services/user.service');
const mockedUserService = UserService as jest.Mocked<typeof UserService>;
jest.mock('../middleware/auth.middleware');
const mockedAuthMiddleware = authenticateToken as jest.Mock;
jest.mock('../middleware/csrf.middleware');
const mockedCsrfProtection = csrfProtection as jest.Mock;

const BASE_PATH = `${paths.api}${paths.users.base}`;

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unprotected User Routes', () => {
    describe('POST /register', () => {
      const endpoint = `${BASE_PATH}${paths.users.register}`;
      it('should return 201 and the new user on successful registration', async () => {
        const userInput: CreateUserData = {
          email: 'test@example.com',
          username: 'test',
          password: 'password123',
        };
        const expectedUser: CreateUserSuccessReturn = {
          id: 1,
          email: userInput.email,
          username: userInput.username,
          password: 'hashedpassword',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockedUserService.validateUniqueFields.mockResolvedValue([]);
        mockedUserService.createUser.mockResolvedValue(expectedUser);

        const response = await request(app).post(endpoint).send(userInput);

        expect(response.status).toBe(201);
        expect(response.body.email).toBe(userInput.email);
        expect(response.body.username).toBe(userInput.username);
        expect(response.body).not.toHaveProperty('password');
        expect(UserService.createUser).toHaveBeenCalledWith(userInput);
      });
      it('should return 409 if validation fails', async () => {
        const userInput: CreateUserData = {
          email: 'test@example.com',
          username: 'test',
          password: 'password123',
        };

        //duplicate email
        mockedUserService.validateUniqueFields.mockResolvedValue(['email']);

        const response = await request(app).post(endpoint).send(userInput);

        expect(response.status).toBe(409);
      });
    });

    describe('POST /login', () => {
      it('should return 200 status, user data, csrfToken and set cookies on successful login', async () => {
        const loginInput: LoginUserData = {
          email: 'test@example.com',
          password: 'password123',
        };
        const expectedResult: LoginUserSuccessReturn = {
          id: 1,
          username: 'test',
          email: loginInput.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockedUserService.loginUser.mockResolvedValue(expectedResult);

        const response = await request(app)
          .post(`${BASE_PATH}${paths.users.login}`)
          .send(loginInput);

        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe(loginInput.email);
        expect(response.body).toHaveProperty('csrfToken');

        const cookieHeaderValue = response.headers['set-cookie'];
        const cookies = Array.isArray(cookieHeaderValue)
          ? cookieHeaderValue
          : [cookieHeaderValue as string];
        expect(cookies).toBeDefined();
        expect(
          cookies.some((cookie) => cookie.startsWith('access_token=')),
        ).toBe(true);
        expect(cookies.some((cookie) => cookie.startsWith('csrf_token='))).toBe(
          true,
        );
      });
    });

    describe('Get /:username', () => {
      it('should return a public user porfile with isFollowing:false for an unauthenticated viewer', async () => {
        const profileData: UserProfileSuccessReturn = {
          isFollowing: false,
          id: 2,
          username: 'user',
          _count: {
            following: 0,
            followers: 0,
          },
        };
        mockedUserService.getUserProfile.mockResolvedValue(profileData);

        const profilePath = createPath(paths.users.profile, {
          username: profileData.username,
        });
        const response = await request(app).get(`${BASE_PATH}${profilePath}`);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe(profileData.username);
        expect(mockedUserService.getUserProfile).toHaveBeenCalledWith(
          profileData.username,
          undefined,
        );
      });

      it('should return a pbulic profile with isFollowing:true if viewer is authenticated', async () => {
        const profileData: UserProfileSuccessReturn = {
          isFollowing: true,
          id: 2,
          username: 'user',
          _count: {
            following: 0,
            followers: 1,
          },
        };
        mockedUserService.getUserProfile.mockResolvedValue(profileData);

        const profilePath = createPath(paths.users.profile, {
          username: profileData.username,
        });
        const response = await request(app)
          .get(`${BASE_PATH}${profilePath}`)
          .set('Cookie', ['access_token=fake-valid-token-for-test']);

        expect(response.status).toBe(200);
        expect(response.body.isFollowing).toBe(true);
      });
    });

    describe('GET /csrf-token', () => {
      it('should return a CSRF token in the response body', async () => {
        const response = await request(app).get(
          `${BASE_PATH}${paths.users.csrf}`,
        );

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        expect(response.body).toHaveProperty('csrfToken');
        expect(typeof response.body.csrfToken).toBe('string');
        expect(response.body.csrfToken.length).toBe(32);

        const cookieHeaderValue = response.headers['set-cookie'];
        const cookies = Array.isArray(cookieHeaderValue)
          ? cookieHeaderValue
          : [cookieHeaderValue as string];
        expect(cookies).toBeDefined();
        expect(cookies.some((cookie) => cookie.startsWith('csrf_token='))).toBe(
          true,
        );
      });
    });
  });

  describe('Protected User Routes', () => {
    const userid = 1;
    beforeEach(() => {
      mockedAuthMiddleware.mockImplementation((req, res, next) => {
        req.user = { userId: userid };
        next();
      });
      mockedCsrfProtection.mockImplementation((req, res, next) => {
        next();
      });
    });
    describe('GET /me', () => {
      const endpoint = `${BASE_PATH}${paths.users.me}`;
      it('should return the user data for the authenticated user', async () => {
        const mockUser = {
          id: 1,
          email: 'test@example.com',
          username: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockedUserService.findUserById.mockResolvedValue(mockUser);

        const response = await request(app).get(endpoint);

        expect(response.status).toBe(200);
        expect(response.body.user.id).toEqual(mockUser.id);
        expect(mockedUserService.findUserById).toHaveBeenCalledWith(
          mockUser.id,
        );
      });

      it('should return 404 if the user is not found', async () => {
        mockedUserService.findUserById.mockResolvedValue(null);

        const response = await request(app).get(endpoint);

        expect(response.status).toBe(404);
      });
    });

    describe('POST /:id/follow', () => {
      it('should return 204 on successful follow', async () => {
        mockedUserService.followUser.mockResolvedValue();
        const followingid = 2;
        const followPath = createPath(paths.users.follow, { id: followingid });
        const response = await request(app).post(`${BASE_PATH}${followPath}`);
        expect(response.status).toBe(204);
        expect(mockedUserService.followUser).toHaveBeenCalledWith(
          userid,
          followingid,
        );
      });
      it('should return 400 if a user tires to follow themselves', async () => {
        const followingid = userid;
        const followPath = createPath(paths.users.follow, { id: followingid });
        const response = await request(app).post(`${BASE_PATH}${followPath}`);

        expect(response.status).toBe(400);
        expect(mockedUserService.followUser).not.toHaveBeenCalled();
      });
    });

    describe('DELETE /:id/follow', () => {
      it('should return 204 on successful unfollow', async () => {
        mockedUserService.unfollowUser.mockResolvedValue();
        const followingid = 2;
        const followPath = createPath(paths.users.follow, { id: followingid });
        const response = await request(app).delete(`${BASE_PATH}${followPath}`);

        expect(response.status).toBe(204);
        expect(mockedUserService.unfollowUser).toHaveBeenCalledWith(
          userid,
          followingid,
        );
      });
      it('should return 400 for an invalid user ID format', async () => {
        const followingid = 'string';
        const followPath = createPath(paths.users.follow, { id: followingid });
        const response = await request(app).delete(`${BASE_PATH}${followPath}`);

        expect(response.status).toBe(400);
        expect(mockedUserService.unfollowUser).not.toHaveBeenCalled();
      });
    });
  });
});
