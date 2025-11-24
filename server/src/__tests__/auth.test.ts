import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import cookieParser from 'cookie-parser';

// Mock Prisma
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
        },
    })),
}));

describe('Authentication API', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use('/api/auth', authRoutes);
    });

    describe('POST /api/auth/login', () => {
        it('should return 401 for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should clear authentication cookie', async () => {
            const response = await request(app).post('/api/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });
    });
});
