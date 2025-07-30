import request from 'supertest';
import app from './index';

describe('GET / The root endpoint', () => {
    it('should respond with a 200 status code and the correct message', async() => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World! Your sever is running.');
    });
});

describe('GET /api/health', ()=>{
    it('should respond with a JSON object containing a status property', async() => {
        const response = await  request(app).get('/api/health');
        expect(response.body.status).toBe('ok');
        expect(response.body).toHaveProperty('timestamp');
    });
});