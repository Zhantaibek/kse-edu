import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('API integration', () => {
  it('healthcheck works', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('login and me flow', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@edu.local', password: 'Admin123!' });

    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeTruthy();

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('admin@edu.local');
  });

  it('lists courses for authenticated user', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@edu.local', password: 'Teacher123!' });

    const courses = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(courses.status).toBe(200);
    expect(Array.isArray(courses.body.data)).toBe(true);
  });
});
