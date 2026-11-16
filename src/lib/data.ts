import { Service, Testimonial, SiteConfig } from './types';
import { uploadRawJson, getRawJson, isCloudinaryConfigured } from './cloudinary';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Deteksi environment serverless Vercel / Cloud
const isServerless = process.env.VERCEL === '1' || !!process.env.NOW_REGION || !!process.env.AWS_REGION;
const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), 'bryz-academic-data')
  : path.join(process.cwd(), 'data');

// In-memory cache fallback saat proses serverless berjalan
const globalMemoryCache: Record<string, any> = {};

// Cache base URL Vercel Blob agar tidak perlu list() berulang
let blobBaseUrl: string | null = null;

// Default initial data
export const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Skripsi',
    category: 'Skripsi & Proposal',
    description: 'Garansi revisi sampai ACC, lolos cek Turnitin < 15%, serta bimbingan materi & olah data lengkap.',
    features: [
      'Garansi revisi sampai ACC',
      'Lolos cek Turnitin < 15%',
      'Bimbingan & Olah Data',
    ],
    estimatedTime: '5 - 14 Hari (Fleksibel)',
    price: 'Mulai Rp 500.000 / Bab',
    icon: '📚',
    imageUrl: null,
    order: 1,
  },
  {
    id: '2',
    name: 'Proposal Skripsi',
    category: 'Skripsi & Proposal',
    description: 'Garansi revisi sampai ACC, lolos cek Turnitin < 15%, serta bimbingan materi & olah data lengkap.',
    features: [
      'Garansi revisi sampai ACC',
      'Lolos cek Turnitin < 15%',
      'Bimbingan & Olah Data',
    ],
    estimatedTime: '5 - 14 Hari (Fleksibel)',
    price: 'Mulai Rp 100.000',
    icon: '📋',
    imageUrl: null,
    order: 2,
  },
  {
    id: '3',
    name: 'Artikel Ilmiah & Jurnal',
    category: 'Publikasi Ilmiah',
    description: 'Format standar Jurnal / SINTA, sitasi Mendeley / Zotero rapi, dan bebas plagiasi.',
    features: [
      'Format Standar Jurnal / SINTA',
      'Sitasi Mendeley / Zotero',
      'Bebas Plagiasi',
    ],
    estimatedTime: '3 - 5 Hari',
    price: 'Mulai Rp 100.000',
    icon: '📰',
    imageUrl: null,
    order: 3,
  },
  {
    id: '4',
    name: 'Makalah Akademik',
    category: 'Karya Tulis',
    description: 'Bebas plagiarisme, referensi buku & jurnal terkini, serta garansi revisi gratis.',
    features: [
      'Bebas Plagiarisme',
      'Referensi Jurnal Terkini',
      'Garansi Revisi Gratis',
    ],
    estimatedTime: '1 - 3 Hari (Bisa Kilat)',
    price: 'Mulai Rp 50.000',
    icon: '📝',
    imageUrl: null,
    order: 4,
  },
  {
    id: '5',
    name: 'Esai & Opini',
    category: 'Karya Tulis',
    description: 'Bebas plagiarisme, referensi jurnal terkini, dan garansi revisi gratis.',
    features: [
      'Bebas Plagiarisme',
      'Referensi Jurnal Terkini',
      'Garansi Revisi Gratis',
    ],
    estimatedTime: '1 - 3 Hari (Bisa Kilat)',
    price: 'Mulai Rp 50.000',
    icon: '✍️',
    imageUrl: null,
    order: 5,
  },
  {
    id: '6',
    name: 'Paper & Review Jurnal',
    category: 'Publikasi Ilmiah',
    description: 'Format standar Jurnal / SINTA, sitasi Mendeley / Zotero rapi, dan bebas plagiasi.',
    features: [
      'Format Standar Jurnal / SINTA',
      'Sitasi Mendeley / Zotero',
      'Bebas Plagiasi',
    ],
    estimatedTime: '3 - 5 Hari',
    price: 'Mulai Rp 50.000',
    icon: '🔬',
    imageUrl: null,
    order: 6,
  },
  {
    id: '7',
    name: 'Tugas Teknik (Engineering)',
    category: 'Tugas Teknik',
    description: 'Kode/perhitungan terverifikasi, lengkap source code & dokumentasi, serta testing dan konsultasi.',
    features: [
      'Kode/Perhitungan Terverifikasi',
      'Source code & Dokumentasi',
      'Testing & Konsultasi',
    ],
    estimatedTime: '2 - 5 Hari / Kilat',
    price: 'Mulai Rp 100.000',
    icon: '⚙️',
    imageUrl: null,
    order: 7,
  },
  {
    id: '8',
    name: 'Policy Brief',
    category: 'Karya Tulis',
    description: 'Format padat & to-the-point, rangkuman analisis isu, serta rekomendasi solusi praktis.',
    features: [
      'Format Padat & To-The-Point',
      'Rangkuman Analisis Isu',
      'Rekomendasi Solusi Praktis',
    ],
    estimatedTime: '1 - 2 Hari / Kilat',
    price: 'Mulai Rp 15.000',
    icon: '📑',
    imageUrl: null,
    order: 8,
  },
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Skripsi Bab 1-5 & Olah Data (ACC Sidang)',
    imageUrl: '/uploads/1793371889528-17jpd6.jpeg',
    rating: 5,
    order: 1,
    month: '2026-11',
  },
  {
    id: '2',
    name: 'Proposal Skripsi & Metodologi (Lolos Seminar)',
    imageUrl: '/uploads/1793372785946-kpovb6.jpeg',
    rating: 5,
    order: 2,
    month: '2026-11',
  },
  {
    id: '3',
    name: 'Artikel Jurnal SINTA 2 (Terbit & Bebas Revisi)',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    order: 3,
    month: '2026-11',
  },
  {
    id: '4',
    name: 'Tugas Teknik: Coding & Analisis Struktur (Nilai A)',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    order: 4,
    month: '2026-11',
  },
];

export const defaultConfig: SiteConfig = {
  whatsappNumber: '6285861950414',
  whatsappNumber2: '6281395866659',
  heroEyebrow: 'Bimbingan & Bantu Tugas Akademik Terpercaya',
  heroTitle: 'Bantu Tugas Sekolah, Kuliah & Riset Akademik Sampai Tuntas',
  heroDescription: 'Pusing mikirin tugas sekolah, tugas kuliah, makalah, skripsi, atau olah data yang mepet deadline? Tim Bryz Academic siap bantu dari awal sampai tuntas. Dikerjakan oleh fresh graduate PTN top 3, rapi, bebas plagiasi (Turnitin aman), dan bergaransi revisi.',
  totalClients: '100+',
  totalProjects: '100+',
  satisfaction: '100%',
  qrisImageUrl: null,
  logoImageUrl: null,
  skripsiFeatures: [
    'Bisa ngerjain Bab 1 sampai 5 lengkap, disesuaikan panduan kampusmu',
    'Bantu olah data (SPSS, Excel, SEM, dll.) plus penjelasannya',
    'Sudah termasuk cek Turnitin aman dan gratis revisi sampai ACC',
  ],
  faqs: [
    {
      q: 'Apakah kerahasiaan identitas dan data saya dijamin aman?',
      a: '100% Terjamin Rahasia. Kami tidak pernah membagikan nama, instansi, maupun file tugas Anda ke pihak mana pun. Privasi Anda aman bersama kami.',
    },
    {
      q: 'Bagaimana jika ada catatan revisi?',
      a: 'Santai, ada garansi revisi gratis tanpa biaya tambahan sampai tugas atau naskah Anda disetujui, sesuai kesepakatan topik dan panduan awal.',
    },
    {
      q: 'Apakah tugas dicek dengan Turnitin resmi?',
      a: 'Ya, seluruh karya tulis dan naskah akademik dicek langsung menggunakan Turnitin resmi no-repository (bebas plagiasi dan tidak tersimpan di database publik).',
    },
    {
      q: 'Berapa lama estimasi pengerjaannya?',
      a: 'Bisa disesuaikan dengan kebutuhan Anda. Butuh pengerjaan kilat (24 - 48 jam) untuk tugas mendesak? Kami siap bantu, atau bisa pengerjaan terjadwal bertahap.',
    },
    {
      q: 'Bagaimana sistem pembayarannya?',
      a: 'Sangat fleksibel dan aman: Bisa DP mulai 30% - 50% untuk mulai pengerjaan. Pelunasan dilakukan setelah tugas selesai dan Anda cek hasilnya.',
    },
  ],
};

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Abaikan jika lingkungan serverless tidak mengizinkan write
  }
}

/**
 * Konstruksi URL Blob secara deterministik dari base URL yang sudah diketahui.
 * Menghindari panggilan list() yang dihitung Advanced Operation.
 */
function constructBlobUrl(key: string): string | null {
  if (!blobBaseUrl) return null;
  return `${blobBaseUrl}/db/${key}.json`;
}

/**
 * Temukan base URL Blob dari blob yang sudah ada.
 * Hanya dipanggil sekali (cold start) lalu di-cache.
 */
async function discoverBlobBaseUrl(): Promise<string | null> {
  if (blobBaseUrl) return blobBaseUrl;

  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (!hasBlob) return null;

  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'db/', limit: 1 });
    if (blobs.length > 0) {
      const url = blobs[0].url;
      const dbIndex = url.indexOf('/db/');
      if (dbIndex > 0) {
        blobBaseUrl = url.substring(0, dbIndex);
        return blobBaseUrl;
      }
    }
  } catch (err) {
    console.warn('[Blob] Could not discover base URL:', err);
  }
  return null;
}

/**
 * Baca data JSON. Urutan prioritas:
 * 1. In-memory cache (zero cost, instan)
 * 2. Cloudinary Raw Storage (Database Cloud Permanen, bebas kuota Vercel Blob)
 * 3. Fetch URL Blob deterministik (zero Blob API cost, hanya HTTP fetch)
 * 4. Discover base URL via list() (satu kali per cold start)
 * 5. File lokal (project dir / tmp)
 * 6. Default value
 */
async function readBlobJson<T>(key: string, defaultValue: T): Promise<T> {
  // 1. Memory cache (tercepat, zero cost)
  if (globalMemoryCache[key] !== undefined) {
    return globalMemoryCache[key] as T;
  }

  // 2. Cloudinary Raw Storage (Database Cloud Utama)
  if (isCloudinaryConfigured()) {
    try {
      const cloudData = await getRawJson<T>(key);
      if (cloudData !== null) {
        globalMemoryCache[key] = cloudData;
        return cloudData;
      }
    } catch (err) {
      console.warn(`[Cloudinary DB] Read warning for ${key}:`, err);
    }
  }

  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

  if (hasBlob) {
    // 2. Coba fetch URL deterministik (tanpa panggilan Blob API)
    const knownUrl = constructBlobUrl(key);
    if (knownUrl) {
      try {
        const res = await fetch(knownUrl, { cache: 'no-store' });
        if (res.ok) {
          const val = (await res.json()) as T;
          globalMemoryCache[key] = val;
          return val;
        }
      } catch {}
    }

    // 3. Cold start: discover base URL lalu coba lagi
    if (!blobBaseUrl) {
      const baseUrl = await discoverBlobBaseUrl();
      if (baseUrl) {
        const discoveredUrl = `${baseUrl}/db/${key}.json`;
        try {
          const res = await fetch(discoveredUrl, { cache: 'no-store' });
          if (res.ok) {
            const val = (await res.json()) as T;
            globalMemoryCache[key] = val;
            return val;
          }
        } catch {}
      }

      // 3b. Jika base URL tidak bisa ditemukan dari prefix 'db/',
      //     coba list() spesifik untuk key ini (legacy data dengan addRandomSuffix)
      try {
        const { list } = await import('@vercel/blob');
        const { blobs } = await list({ prefix: `db/${key}` });
        if (blobs.length > 0) {
          const sorted = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          // Simpan base URL untuk pemakaian selanjutnya
          const url = sorted[0].url;
          const dbIndex = url.indexOf('/db/');
          if (dbIndex > 0) {
            blobBaseUrl = url.substring(0, dbIndex);
          }
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const val = (await res.json()) as T;
            globalMemoryCache[key] = val;
            return val;
          }
        }
      } catch (err) {
        console.warn(`[Blob] Read warning for ${key}:`, err);
      }
    }
  }

  // 4. Local fallback - Check project directory first, then DATA_DIR
  try {
    const projectPath = path.join(process.cwd(), 'data', `${key}.json`);
    if (fs.existsSync(projectPath)) {
      const content = fs.readFileSync(projectPath, 'utf-8');
      const val = JSON.parse(content);
      globalMemoryCache[key] = val;
      return val;
    }
  } catch {}

  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const val = JSON.parse(content);
      globalMemoryCache[key] = val;
      return val;
    }
  } catch {}

  return defaultValue;
}

/**
 * Simpan data JSON. Menggunakan put() tanpa addRandomSuffix
 * sehingga URL deterministik dan tidak perlu list() + del().
 *
 * Operasi Blob yang digunakan: hanya put() (Standard, bukan Advanced).
 */
async function writeBlobJson<T>(key: string, data: T): Promise<void> {
  // Simpan ke in-memory cache
  globalMemoryCache[key] = data;
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Maintain local copy in project directory if writable
  try {
    const projectDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    const projectPath = path.join(projectDir, `${key}.json`);
    fs.writeFileSync(projectPath, jsonStr);
  } catch {}

  // 2. Maintain local/tmp copy in DATA_DIR
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${key}.json`);
    fs.writeFileSync(filePath, jsonStr);
  } catch {}

  // 3. Simpan ke Cloudinary Raw Storage (Database Cloud Utama, Permanen & Bebas Kuota)
  if (isCloudinaryConfigured()) {
    try {
      await uploadRawJson(key, jsonStr);
    } catch (err) {
      console.warn(`[Cloudinary DB] Write warning for ${key}:`, err);
    }
  }

  // 4. Simpan ke Vercel Blob (Legacy fallback jika ada token)
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (hasBlob) {
    try {
      const { put } = await import('@vercel/blob');
      const newBlob = await put(`db/${key}.json`, jsonStr, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Cache base URL dari hasil put() untuk pembacaan selanjutnya
      const dbIndex = newBlob.url.indexOf('/db/');
      if (dbIndex > 0) {
        blobBaseUrl = newBlob.url.substring(0, dbIndex);
      }
    } catch (err) {
      console.warn(`[Blob] Write warning for ${key}:`, err);
    }
  }
}

// ================= Services API =================
export async function getServices(): Promise<Service[]> {
  return await readBlobJson<Service[]>('services', defaultServices);
}

export async function saveServices(services: Service[]): Promise<void> {
  await writeBlobJson('services', services);
}

export async function addService(service: Omit<Service, 'id' | 'order'>): Promise<Service> {
  const services = await getServices();
  const newService: Service = {
    ...service,
    id: Date.now().toString(),
    order: services.length + 1,
  };
  services.push(newService);
  await saveServices(services);
  return newService;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  const services = await getServices();
  let index = services.findIndex((s) => String(s.id) === String(id));
  if (index === -1 && updates.name) {
    index = services.findIndex((s) => s.name.toLowerCase() === updates.name?.toLowerCase());
  }
  if (index === -1) {
    const newService: Service = {
      id: String(id),
      name: updates.name || 'Layanan Baru',
      description: updates.description || '',
      price: updates.price || 'Hubungi Admin',
      icon: updates.icon || '📚',
      imageUrl: updates.imageUrl || null,
      category: updates.category,
      features: updates.features,
      estimatedTime: updates.estimatedTime,
      order: services.length + 1,
      ...updates,
    };
    services.push(newService);
    await saveServices(services);
    return newService;
  }
  services[index] = { ...services[index], ...updates };
  await saveServices(services);
  return services[index];
}

export async function deleteService(id: string): Promise<boolean> {
  const services = await getServices();
  const filtered = services.filter((s) => s.id !== id);
  if (filtered.length === services.length) return false;
  await saveServices(filtered);
  return true;
}

// ================= Testimonials API =================
export async function getTestimonials(): Promise<Testimonial[]> {
  return await readBlobJson<Testimonial[]>('testimonials', defaultTestimonials);
}

export async function saveTestimonials(testimonials: Testimonial[]): Promise<void> {
  await writeBlobJson('testimonials', testimonials);
}

export async function addTestimonial(testimonial: Omit<Testimonial, 'id' | 'order'>): Promise<Testimonial> {
  const testimonials = await getTestimonials();
  const newTestimonial: Testimonial = {
    ...testimonial,
    id: Date.now().toString(),
    order: testimonials.length + 1,
  };
  testimonials.push(newTestimonial);
  await saveTestimonials(testimonials);
  return newTestimonial;
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
  const testimonials = await getTestimonials();
  const index = testimonials.findIndex((t) => String(t.id) === String(id));
  if (index === -1) return null;
  testimonials[index] = { ...testimonials[index], ...updates };
  await saveTestimonials(testimonials);
  return testimonials[index];
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const testimonials = await getTestimonials();
  const filtered = testimonials.filter((t) => t.id !== id);
  if (filtered.length === testimonials.length) return false;
  await saveTestimonials(filtered);
  return true;
}

// ================= Config API =================
export async function getConfig(): Promise<SiteConfig> {
  const conf = await readBlobJson<SiteConfig>('config', defaultConfig);
  return {
    ...defaultConfig,
    ...conf,
    whatsappNumber: conf.whatsappNumber || defaultConfig.whatsappNumber,
    whatsappNumber2: conf.whatsappNumber2 || defaultConfig.whatsappNumber2 || '6281395866659',
  };
}

export async function saveConfig(config: SiteConfig): Promise<void> {
  await writeBlobJson('config', config);
}
