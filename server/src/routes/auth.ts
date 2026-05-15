import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { verifyPassword } from '../lib/password.js';
import { ApiError } from '../middleware/error.js';
import { signAccessToken } from '../lib/jwt.js';
import { generateRefreshToken, getRefreshTokenExpiry, hashRefreshToken } from '../lib/refresh-token.js';
import { env } from '../config/env.js';
import { toPublicUser } from '../utils/public-user.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthTokenPayload } from '../types/auth.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshCookieConfig = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
};

const buildAuthPayload = (user: {
  userId: string;
  role: AuthTokenPayload['role'];
  adminScopeType: AuthTokenPayload['scopeType'];
  adminSchoolId: string | null;
  adminDepartmentId: string | null;
}) => {
  return {
    sub: user.userId,
    role: user.role,
    scopeType: user.adminScopeType,
    schoolId: user.adminSchoolId,
    departmentId: user.adminDepartmentId,
  };
};

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie('refreshToken', refreshToken, {
    ...refreshCookieConfig,
    expires: getRefreshTokenExpiry(),
  });
};

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account is currently inactive. Contact an administrator.');
    }

    const isValidPassword = await verifyPassword(payload.password, user.passwordHash);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(refreshToken),
        userId: user.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const accessToken = signAccessToken(buildAuthPayload(user));
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken as string | undefined;
    if (!rawRefreshToken) {
      throw new ApiError(401, 'Refresh token is missing');
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt.getTime() < Date.now()) {
      throw new ApiError(401, 'Refresh token is invalid or expired');
    }

    if (!tokenRecord.user.isActive) {
      throw new ApiError(403, 'Your account is currently inactive. Contact an administrator.');
    }

    await prisma.refreshToken.update({
      where: { refreshTokenId: tokenRecord.refreshTokenId },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(newRefreshToken),
        userId: tokenRecord.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const accessToken = signAccessToken(buildAuthPayload(tokenRecord.user));
    setRefreshCookie(res, newRefreshToken);

    res.json({
      accessToken,
      user: toPublicUser(tokenRecord.user),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken as string | undefined;
    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    res.clearCookie('refreshToken', refreshCookieConfig);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      throw new ApiError(401, 'User session is no longer valid');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account is currently inactive. Contact an administrator.');
    }

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
});
