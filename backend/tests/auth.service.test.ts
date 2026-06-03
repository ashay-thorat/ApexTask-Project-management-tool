import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/services/auth.service';
import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn().mockResolvedValue({}),
    }
  }
}));

vi.mock('../src/utils/firebase', () => {
  return {
    firebaseAdmin: {
      auth: vi.fn().mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          email: 'googleuser@test.com',
          name: 'Google User',
          picture: 'avatar.png',
          uid: 'google123'
        })
      })
    }
  };
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  it('should register a new user successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'usr1',
      email: 'test@test.com',
      name: 'Test User',
      passwordHash: 'hashed',
      avatarUrl: null,
      googleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.register('test@test.com', 'password', 'Test User');
    expect(result.user.email).toBe('test@test.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should throw error if registering with existing email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'usr1' } as any);

    await expect(authService.register('test@test.com', 'password', 'Test User'))
      .rejects
      .toThrow('Email already registered');
  });

  it('should login successfully with valid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'usr1',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('password', 10),
    } as any);

    const result = await authService.login('test@test.com', 'password');
    expect(result.user.email).toBe('test@test.com');
  });
  
  it('should throw error with invalid password on login', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'usr1',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('password', 10),
    } as any);

    await expect(authService.login('test@test.com', 'wrongpassword'))
      .rejects
      .toThrow('Invalid credentials');
  });
  
  it('should authenticate user via Google Auth', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'usr2',
      email: 'googleuser@test.com',
      name: 'Google User',
      passwordHash: null,
      avatarUrl: 'avatar.png',
      googleId: 'google123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.googleAuth('valid_id_token');
    expect(result.user.email).toBe('googleuser@test.com');
    expect((result.user as any).googleId).toBeUndefined(); // It's not returned in the frontend user object mapping
  });
});
