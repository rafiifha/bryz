import { NextResponse } from 'next/server';

// Admin password harus diatur di environment variable (.env.local)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Token sederhana yang digenerate dari password (bukan password mentah)
function generateToken(password: string): string {
  let hash = 0;
  const salt = 'bryz_admin_token_salt_2024';
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'bryz_' + Math.abs(hash).toString(36) + '_admin';
}

export function getAdminToken(): string | null {
  if (!ADMIN_PASSWORD) return null;
  return generateToken(ADMIN_PASSWORD);
}

export function verifyPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  return password === ADMIN_PASSWORD;
}

export function verifyAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  const validToken = getAdminToken();
  if (!validToken) return false;
  return token === validToken;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
