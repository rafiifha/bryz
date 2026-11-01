import { NextResponse } from 'next/server';
import { verifyPassword, getAdminToken } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (verifyPassword(password)) {
    const token = getAdminToken();
    return NextResponse.json({ token });
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
