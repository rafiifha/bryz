import { NextResponse } from 'next/server';

// Simple admin auth - in production, use a proper auth solution
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bryz2024admin';

export function verifyAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  return authHeader.split(' ')[1] === ADMIN_PASSWORD;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
