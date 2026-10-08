import { describe, expect, it } from 'vitest';
import { createHash, randomBytes } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

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

  it('magic link verify flow', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'admin@edu.local' } });
    expect(user).toBeTruthy();

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await prisma.magicLinkToken.create({
      data: {
        userId: user!.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
      });

    const verify = await request(app)
      .post('/api/auth/verify-magic-link')
      .send({ token: rawToken });

    expect(verify.status).toBe(200);
    expect(verify.body.data.token).toBeTruthy();
  });

  it('email otp verify flow', async () => {
    const user = await pris    ma.user.findUnique({ where: { email: 'admin@edu.local' } });
    expect(user).toBeTruthy();

    const code = '123456';
    const tokenHash = createHash('sha256').update(randomBytes(32).toString('hex')).digest('hex');
    const codeHash = createHash('sha256').update(code).digest('hex');
    await prisma.magicLinkToken.create({
      data: {
        userId: user!.id,
        tokenHash,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const verify = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'admin@edu.local', code });

    expect(verify.status).toBe(200);
    expect(verify.body.data.token).toBeTruthy();
  });
});
