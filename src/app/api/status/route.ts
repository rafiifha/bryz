import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasEnv = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  let blobConnected = hasEnv;
  let errorMsg: string | null = null;

  if (hasEnv) {
    try {
      await list({ limit: 1 });
      blobConnected = true;
    } catch (err: any) {
      blobConnected = false;
      errorMsg = err.message || 'Error listing blobs';
    }
  }

  return NextResponse.json({
    blobConnected,
    hasEnv,
    hasStoreId: Boolean(process.env.BLOB_STORE_ID),
    hasToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    isVercel: process.env.VERCEL === '1',
    error: errorMsg,
    timestamp: new Date().toISOString(),
  });
}
