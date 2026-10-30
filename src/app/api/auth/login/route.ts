import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bryz2024admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ token: ADMIN_PASSWORD });
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
