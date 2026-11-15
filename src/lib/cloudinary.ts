import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;

/**
 * Upload gambar ke Cloudinary via buffer.
 * Mengembalikan secure URL yang bisa langsung dipakai di <img src>.
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string = 'bryz-support'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload ke Cloudinary gagal'));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * In-memory cache untuk URL raw JSON
 */
const rawUrlCache: Record<string, string> = {};

/**
 * Upload raw JSON ke Cloudinary (Database Persistence).
 * Menghasilkan URL permanen yang bisa dibaca kapan saja tanpa batasan kuota Vercel Blob.
 */
export async function uploadRawJson(key: string, jsonStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'bryz-db',
        public_id: `${key}.json`,
        resource_type: 'raw',
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error(`Upload raw JSON ${key} gagal`));
        }
        rawUrlCache[key] = result.secure_url;
        resolve(result.secure_url);
      }
    );
    stream.end(Buffer.from(jsonStr, 'utf-8'));
  });
}

/**
 * Baca raw JSON dari Cloudinary.
 */
export async function getRawJson<T>(key: string): Promise<T | null> {
  try {
    let url = rawUrlCache[key];
    if (url) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) return (await res.json()) as T;
      } catch {}
    }

    const resource = await cloudinary.api.resource(`bryz-db/${key}.json`, {
      resource_type: 'raw',
    });
    if (!resource || !resource.secure_url) return null;
    rawUrlCache[key] = resource.secure_url;

    const res = await fetch(resource.secure_url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Cek apakah Cloudinary dikonfigurasi dan dapat terhubung.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )
  );
}
