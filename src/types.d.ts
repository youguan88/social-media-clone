interface JwtPayload {
  userId: number;
}

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}
