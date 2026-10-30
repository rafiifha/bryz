import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return NextResponse.json({
    blobConnected: Boolean(token && token.length > 10),
    isVercel: process.env.VERCEL === '1',
    timestamp: new Date().toISOString(),
  });
}
