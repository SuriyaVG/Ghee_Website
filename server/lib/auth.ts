import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export function signToken(payload: object, type: 'access' | 'refresh') {
  return jwt.sign(payload, type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET, {
    expiresIn: type === 'access' ? '15m' : '7d',
  });
}

export function verifyToken(token: string, type: 'access' | 'refresh') {
  return jwt.verify(token, type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET) as any;
} 