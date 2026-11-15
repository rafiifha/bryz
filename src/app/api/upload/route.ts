import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  if (!verifyAuth(request)) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Cloudinary (prioritas utama jika dikonfigurasi)
    if (isCloudinaryConfigured()) {
      try {
        const url = await uploadImage(buffer, 'bryz-support');
        return NextResponse.json({ url });
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back:', err);
      }
    }

    // 2. Vercel Blob fallback (jika masih terkonfigurasi dan Cloudinary belum siap)
    const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
    if (hasBlob) {
      try {
        const { put } = await import('@vercel/blob');
        const ext = path.extname(file.name) || '.png';
        const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}${ext}`;
        const blob = await put(`bryz-support/${cleanName}`, file, {
          access: 'public',
        });
        return NextResponse.json({ url: blob.url });
      } catch (err) {
        console.warn('Vercel Blob upload failed, falling back:', err);
      }
    }

    // 3. Serverless fallback (Read-only filesystem) -> Base64
    const isServerless = process.env.VERCEL === '1' || !!process.env.NOW_REGION || !!process.env.AWS_REGION || process.env.NODE_ENV === 'production';
    if (isServerless) {
      const mimeType = file.type || 'image/png';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    // 4. Local filesystem storage (development)
    try {
      ensureUploadDir();
      const ext = path.extname(file.name) || '.png';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filepath, buffer);
      const url = `/uploads/${filename}`;
      return NextResponse.json({ url });
    } catch {
      const mimeType = file.type || 'image/png';
      const base64 = buffer.toString('base64');
      return NextResponse.json({ url: `data:${mimeType};base64,${base64}` });
    }
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
