import express, { Request, Response, Application } from 'express'
import { UserService } from './services/user.service';

const app: Application = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World! Your sever is running.');
});

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/users/register', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.'});
        }
        const newUser = await UserService.createUser({email, password});
        res.status(201).json({
            id: newUser.id,
            email: newUser.email
        })
    } catch (error: any) {
        if(error.code === 'P2002'){
            return res.status(409).json({ message: 'An account with this email already exists.'});
        }
        res.status(500).json({ message: 'An error occured during registration.'})
    }
});

export default app;