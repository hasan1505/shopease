import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User, { IUser } from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(id: string): string {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): { id: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string };
}

/**
 * Authenticate a request from its Authorization: Bearer <token> header.
 * Returns the user document, or null when unauthenticated.
 */
export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    await connectDB();
    const user = await User.findById(decoded.id).select('+password');
    return user || null;
  } catch {
    return null;
  }
}
