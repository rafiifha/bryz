/**
 * Script Migrasi Gambar dari Vercel Blob / Lokal ke Cloudinary
 * 
 * Cara Penggunaan:
 * 1. Pastikan file .env.local berisi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * 2. Jalankan: node scripts/migrate-to-cloudinary.js
 * 
 * Script ini:
 * - Membaca data/testimonials.json, data/services.json, data/config.json
 * - Mencari URL gambar yang berasal dari Vercel Blob (*.blob.vercel-storage.com) atau lokal (/uploads/*)
 * - Mengunggah file ke Cloudinary secara otomatis
 * - Membuat backup data lama ke data/backup_<timestamp>/
 * - Memperbarui file JSON dengan URL aman dari Cloudinary
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
  console.error('Pastikan salah satu dari ini terisi:');
  console.error('Opsi A:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
  console.error('Opsi B:');
  console.error('- CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name>\n');
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
const BACKUP_DIR = path.join(DATA_DIR, `backup_${Date.now()}`);

async function uploadToCloudinary(source) {
  try {
    // Jika path lokal (/uploads/...)
    if (source.startsWith('/uploads/')) {
      const localFile = path.join(__dirname, '..', 'public', source);
      if (!fs.existsSync(localFile)) {
        console.warn(`  ⚠️ File lokal tidak ditemukan: ${localFile}`);
        return null;
      }
      const res = await cloudinary.uploader.upload(localFile, {
        folder: 'bryz-support/migrated',
        quality: 'auto',
        fetch_format: 'auto',
      });
      return res.secure_url;
    }

    // Jika URL Vercel Blob atau remote
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const res = await cloudinary.uploader.upload(source, {
        folder: 'bryz-support/migrated',
        quality: 'auto',
        fetch_format: 'auto',
      });
      return res.secure_url;
    }

    return null;
  } catch (err) {
    const detail = (err && err.error && err.error.message) || err.message || JSON.stringify(err);
    console.error(`  ❌ Gagal mengunggah ${source}:`, detail);
    if (err && err.http_code) {
      console.error(`     HTTP Status: ${err.http_code}`);
    }
    return null;
  }
}

async function run() {
  console.log('🚀 Memulai migrasi gambar ke Cloudinary...\n');

  if (!fs.existsSync(DATA_DIR)) {
    console.log('Tidak ada folder data/ untuk diproses.');
    return;
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Backup dibuat di: ${BACKUP_DIR}\n`);

  const files = ['testimonials.json', 'services.json', 'config.json'];

  for (const fileName of files) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    console.log(`🔍 Memeriksa ${fileName}...`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    fs.writeFileSync(path.join(BACKUP_DIR, fileName), raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.warn(`  ⚠️ File ${fileName} bukan JSON valid, dilewati.`);
      continue;
    }

    let modified = false;

    // 1. Array Testimonials
    if (fileName === 'testimonials.json' && Array.isArray(data)) {
      for (const item of data) {
        if (item.imageUrl && !item.imageUrl.includes('res.cloudinary.com')) {
          console.log(`  Mengunggah: ${item.name} (${item.imageUrl})...`);
          const newUrl = await uploadToCloudinary(item.imageUrl);
          if (newUrl) {
            console.log(`  ✅ Berhasil -> ${newUrl}`);
            item.imageUrl = newUrl;
            modified = true;
          }
        }
      }
    }

    // 2. Array Services
    if (fileName === 'services.json' && Array.isArray(data)) {
      for (const item of data) {
        if (item.imageUrl && !item.imageUrl.includes('res.cloudinary.com')) {
          console.log(`  Mengunggah: ${item.name} (${item.imageUrl})...`);
          const newUrl = await uploadToCloudinary(item.imageUrl);
          if (newUrl) {
            console.log(`  ✅ Berhasil -> ${newUrl}`);
            item.imageUrl = newUrl;
            modified = true;
          }
        }
      }
    }

    // 3. Object Config
    if (fileName === 'config.json' && typeof data === 'object' && data !== null) {
      if (data.qrisImageUrl && !data.qrisImageUrl.includes('res.cloudinary.com')) {
        console.log(`  Mengunggah QRIS image (${data.qrisImageUrl})...`);
        const newUrl = await uploadToCloudinary(data.qrisImageUrl);
        if (newUrl) {
          console.log(`  ✅ Berhasil QRIS -> ${newUrl}`);
          data.qrisImageUrl = newUrl;
          modified = true;
        }
      }
      if (data.logoImageUrl && !data.logoImageUrl.includes('res.cloudinary.com')) {
        console.log(`  Mengunggah Logo image (${data.logoImageUrl})...`);
        const newUrl = await uploadToCloudinary(data.logoImageUrl);
        if (newUrl) {
          console.log(`  ✅ Berhasil Logo -> ${newUrl}`);
          data.logoImageUrl = newUrl;
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`💾 File ${fileName} berhasil diperbarui dengan URL Cloudinary.\n`);
    } else {
      console.log(`  ℹ️ Tidak ada URL yang perlu dimigrasikan pada ${fileName}.\n`);
    }
  }

  console.log('🎉 Migrasi selesai!');
}

run();
