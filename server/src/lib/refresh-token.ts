import { createHmac, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

export const generateRefreshToken = (): string => {
  return randomBytes(48).toString('hex');
};

export const hashRefreshToken = (rawToken: string): string => {
  return createHmac('sha256', env.JWT_REFRESH_SECRET).update(rawToken).digest('hex');
};

export const getRefreshTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
  return expiry;
};
