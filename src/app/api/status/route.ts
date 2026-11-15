import { NextResponse } from 'next/server';
import { isCloudinaryConfigured } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Cek Vercel Blob (hanya environment variable, tanpa memanggil list())
  const hasBlobEnv = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

  // Cek Cloudinary
  const cloudinaryReady = isCloudinaryConfigured();

  // Storage dianggap connected jika salah satu provider aktif
  const blobConnected = hasBlobEnv || cloudinaryReady;

  return NextResponse.json({
    blobConnected,
    hasEnv: hasBlobEnv,
    hasStoreId: Boolean(process.env.BLOB_STORE_ID),
    hasToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    cloudinaryReady,
    isVercel: process.env.VERCEL === '1',
    storageProvider: cloudinaryReady ? 'cloudinary' : hasBlobEnv ? 'vercel-blob' : 'local',
    timestamp: new Date().toISOString(),
  });
}
