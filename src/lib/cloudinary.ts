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
