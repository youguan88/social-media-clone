import express, { Request, Response, Application } from 'express'

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World! Your sever is running.');
});

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

export default app;