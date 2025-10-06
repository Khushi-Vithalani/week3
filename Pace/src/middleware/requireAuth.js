// tests/auth.logout.withTokens.test.js
process.env.NODE_ENV = 'test';

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');

// Use your real router
const authRoutes = require('../routes/auth');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRoutes);
    return app;
}

// ⬇️ Paste your tokens here (from your message)
const ACCESS = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGM3MjMyMmE4Njc5YmMyZTUwN2VlYzgiLCJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTc1Nzk3NTc0MywiZXhwIjoxNzU3OTc2NjQzfQ.c-2Wkyc9TbN58uCKnDGJ6lrykL-Uml9O6lg78K6iLGk';
const REFRESH = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGM3MjMyMmE4Njc5YmMyZTUwN2VlYzgiLCJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTc1Nzk3NTc0MywiZXhwIjoxNzU4NTgwNTQzfQ.XbLRjXQcipZQZ1qP1ATPxAbsm9nSCiqUImzgY0MCof4';

describe('POST /api/auth/logout (with provided tokens)', () => {
    let app;

    beforeAll(() => {
        app = buildApp();
    });

    it('clears accessToken and refreshToken and returns success', async () => {
        // Send cookies as if you were logged in
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', [
                `accessToken=${ACCESS}; Path=/`,
                `refreshToken=${REFRESH}; Path=/`,
            ])
            .expect(200);

        expect(res.body).toEqual({ success: true });

        const setCookies = res.headers['set-cookie'];
        expect(Array.isArray(setCookies)).toBe(true);

        const accessCleared = setCookies.find((c) => /^accessToken=;/.test(c));
        const refreshCleared = setCookies.find((c) => /^refreshToken=;/.test(c));

        expect(accessCleared).toBeDefined();
        expect(refreshCleared).toBeDefined();

        // Cookie attributes in test env (NODE_ENV !== 'production')
        for (const c of [accessCleared, refreshCleared]) {
            expect(c).toMatch(/Path=\//i);
            expect(c).toMatch(/HttpOnly/i);
            expect(c).toMatch(/SameSite=Lax/i);
            expect(c).toMatch(/Expires=/i);     // cleared -> past expiry
            expect(c).not.toMatch(/Secure/i);   // not set in test env
        }
    });
});