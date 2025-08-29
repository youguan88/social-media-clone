import { UserService } from '../services/user.service';

export interface JwtPayload {
  userId: number;
}

type LoginUserPromise = ReturnType<typeof UserService.loginUser>;
type LoginUserResolved = Awaited<LoginUserPromise>;
export type LoginUserSuccessReturn = NonNullable<LoginUserResolved>;

type CreateUserPromise = ReturnType<typeof UserService.createUser>;
export type CreateUserSuccessReturn = Awaited<CreateUserPromise>;
