declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLIENT_ORIGIN_URL: string;
    NODE_ENV: string;
  }
}
