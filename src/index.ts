import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware/auth.middleware';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import cookieParser from 'cookie-parser';

const app: Application = express();
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World! Your sever is running.');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/me', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  res.json({
    message: `You are authenticated successfully! Your user ID is ${userId}.`,
  });
});

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

export default app;
