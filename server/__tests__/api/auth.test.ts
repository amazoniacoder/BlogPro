import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import authRouter from '../../api/auth';

// Mock auth service
vi.mock('../../services/authService', () => ({
  registerUser: vi.fn(),
  authenticateUser: vi.fn(),
  verifyUser: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('registers user with valid data', async () => {
      const mockUser = {
        id: '1',
        login: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: null,
        lastName: null,
        role: 'user' as const,
        emailVerified: false,
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: null
      };
      const { registerUser } = await import('../../services/authService');
      vi.mocked(registerUser).mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/auth/register')
        .send({
          login: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('User registered');
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('authenticates user with valid credentials', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'user' };
      const { authenticateUser } = await import('../../services/authService');
      vi.mocked(authenticateUser).mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(mockUser);
    });

    it('rejects invalid credentials', async () => {
      const { authenticateUser } = await import('../../services/authService');
      vi.mocked(authenticateUser).mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});