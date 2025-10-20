import request from 'supertest';
import app from '../index';

describe('Heatlh Routes', () => {
  describe('GET /api/health', () => {
    it('should respond with a 200 status and an ok status message', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
