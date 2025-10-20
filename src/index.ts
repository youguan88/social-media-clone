import express, { Application } from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import healthRoutes from './routes/heath.routes';
import cookieParser from 'cookie-parser';
import { paths } from './constants';

const app: Application = express();
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(paths.api, healthRoutes);
app.use(`${paths.api}${paths.users.base}`, userRoutes);
app.use(`${paths.api}${paths.posts.base}`, postRoutes);

export default app;
