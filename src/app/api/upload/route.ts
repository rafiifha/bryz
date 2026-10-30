import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { put } from '@vercel/blob';
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

    // 1. If Vercel Blob token is configured, upload directly to Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      try {
        const ext = path.extname(file.name) || '.png';
        const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const blob = await put(`bryz-support/${cleanName}`, file, {
          access: 'public',
          token,
        });
        return NextResponse.json({ url: blob.url });
      } catch (err) {
        console.warn('Vercel Blob upload failed, falling back to local file storage:', err);
      }
    }

    // 2. Serverless Vercel fallback (Read-only filesystem)
    if (process.env.VERCEL === '1') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/png';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    // 3. Local filesystem storage fallback (development environment)
    try {
      ensureUploadDir();
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || '.png';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);

      fs.writeFileSync(filepath, buffer);

      const url = `/uploads/${filename}`;
      return NextResponse.json({ url });
    } catch {
      // Jika lokal FS pun tidak bisa diakses, gunakan Base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/png';
      const base64 = buffer.toString('base64');
      return NextResponse.json({ url: `data:${mimeType};base64,${base64}` });
    }
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
