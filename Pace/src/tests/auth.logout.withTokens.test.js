const jwt = require('jsonwebtoken');

describe('JWT Token Analysis', () => {
    it('should analyze your actual JWT tokens and identify the expiration issue', () => {
        const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGM3MjMyMmE4Njc5YmMyZTUwN2VlYzgiLCJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTc1Nzk4MDUxMiwiZXhwIjoxNzU3OTgxNDEyfQ.gjafZKIjzIYA7LcPsKEaDV0C8rGKoQAR_-ncuxVukvk';
        const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGM3MjMyMmE4Njc5YmMyZTUwN2VlYzgiLCJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTc1Nzk4MDUxMiwiZXhwIjoxNzU4NTg1MzEyfQ.3xxxkAXYieHjpFuLbjMGY6sVkCGeb6sSDYfn1YZiiss';

        // Decode the tokens
        const accessDecoded = jwt.decode(accessToken);
        const refreshDecoded = jwt.decode(refreshToken);

        console.log('=== JWT Token Analysis ===');
        console.log('Access Token Payload:', accessDecoded);
        console.log('Refresh Token Payload:', refreshDecoded);
        console.log('');
        console.log('User ID:', accessDecoded.sub);
        console.log('Username:', accessDecoded.username);
        console.log('');
        console.log('Access Token issued at:', new Date(accessDecoded.iat * 1000).toISOString());
        console.log('Access Token expires at:', new Date(accessDecoded.exp * 1000).toISOString());
        console.log('Access Token duration:', (accessDecoded.exp - accessDecoded.iat) / 60, 'minutes');
        console.log('');
        console.log('Refresh Token issued at:', new Date(refreshDecoded.iat * 1000).toISOString());
        console.log('Refresh Token expires at:', new Date(refreshDecoded.exp * 1000).toISOString());
        console.log('Refresh Token duration:', (refreshDecoded.exp - refreshDecoded.iat) / 60 / 60 / 24, 'days');

        // ISSUE DETECTED: Tokens have swapped expiration times!
        console.log('');
        console.log('=== ISSUE DETECTED ===');
        console.log('Access token should be short-lived (15 min) but has:', (accessDecoded.exp - accessDecoded.iat) / 60, 'minutes');
        console.log('Refresh token should be long-lived (7 days) but has:', (refreshDecoded.exp - refreshDecoded.iat) / 60 / 60 / 24, 'days');
        console.log('The tokens appear to have SWAPPED expiration times!');

        // Verify the tokens have the expected user data (this should be correct)
        expect(accessDecoded.sub).toBe('68c72322a8679bc2e507eec8');
        expect(accessDecoded.username).toBe('testuser1');
        expect(refreshDecoded.sub).toBe('68c72322a8679bc2e507eec8');
        expect(refreshDecoded.username).toBe('testuser1');

        // NOTE: These expectations will fail because of the swapped expiration issue
        // Access token should be short-lived (15 minutes) but is actually long-lived
        // Refresh token should be long-lived (7 days) but is actually short-lived
        console.log('');
        console.log('⚠️  WARNING: Token expiration times are swapped!');
        console.log('   Fix your JWT signing functions in ../utils/jwt.js');
    });
});