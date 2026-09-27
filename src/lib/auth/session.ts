import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '../db/types';

const JWT_SECRET = process.env.JWT_SECRET || 'mausam_production_fallback_jwt_secret_key_987654321';
const COOKIE_NAME = 'mausam_session';

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  fullName: string;
}

export function signToken(user: User): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}
