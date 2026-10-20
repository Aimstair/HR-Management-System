import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import type { AppRole } from '../types/auth.js';
import { ApiError } from './error.js';

const parseBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice(7);
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = parseBearerToken(req.headers.authorization);

  if (!token) {
    next(new ApiError(401, 'Missing authorization token'));
    return;
  }

  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired authorization token'));
  }
};

export const requireRoles = (...roles: AppRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new ApiError(401, 'Authentication is required'));
      return;
    }

    if (!roles.includes(req.auth.role)) {
      next(new ApiError(403, 'Insufficient role permissions'));
      return;
    }

    next();
  };
};
