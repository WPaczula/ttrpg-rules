import { createHmac } from 'crypto';

export function validatePassword(password: string | null): boolean {
  if (!password) return false;
  return password === process.env.ACCESS_PASSWORD;
}

export function createSessionToken(): string {
  return createHmac('sha256', process.env.ACCESS_PASSWORD || '')
    .update('daggerheart-session')
    .digest('hex');
}

export function validateSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  return token === createSessionToken();
}
