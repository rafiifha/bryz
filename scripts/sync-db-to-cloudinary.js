/**
 * Script Sinkronisasi Database JSON ke Cloudinary Raw Storage
 * 
 * Menjadikan Cloudinary sebagai database cloud permanen.
 * Jalankan: node scripts/sync-db-to-cloudinary.js
 */

const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// Load environment variables dari .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) {
        process.env[k.trim()] = v.join('=').trim();
      }
    }
  });
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
  console.error('\n❌ Kredensial Cloudinary belum lengkap di .env.local!');
  process.exit(1);
}

if (cloudinaryUrl) {
  cloudinary.config({ cloudinary_url: cloudinaryUrl });
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const keys = ['services', 'testimonials', 'config'];

async function syncKey(key) {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`  ℹ️ File ${key}.json tidak ditemukan di local data.`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`📤 Mengunggah ${key}.json ke Cloudinary (bryz-db/${key}.json)...`);

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
          console.error(`  ❌ Gagal mengunggah ${key}.json:`, error && error.message);
          return reject(error);
        }
        console.log(`  ✅ Berhasil -> ${result.secure_url}`);
        resolve(result.secure_url);
      }
    );
    stream.end(Buffer.from(content, 'utf-8'));
  });
}

async function run() {
  console.log('🚀 Memulai sinkronisasi Database JSON ke Cloudinary...\n');
  for (const k of keys) {
    try {
      await syncKey(k);
    } catch (e) {
      // lanjut ke key berikutnya
    }
  }
  console.log('\n🎉 Sinkronisasi Database ke Cloudinary selesai!');
}

run();
