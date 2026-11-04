import { Service, Testimonial, SiteConfig } from './types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { put, list, del } from '@vercel/blob';

// Deteksi environment serverless Vercel / Cloud
const isServerless = process.env.VERCEL === '1' || !!process.env.NOW_REGION || !!process.env.AWS_REGION || process.env.NODE_ENV === 'production';
const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), 'bryz-academic-data')
  : path.join(process.cwd(), 'data');

// In-memory cache fallback saat proses serverless berjalan
const globalMemoryCache: Record<string, any> = {};

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
  },
  {
    id: '2',
    name: 'Proposal Skripsi & Metodologi (Lolos Seminar)',
    imageUrl: '/uploads/1793372785946-kpovb6.jpeg',
    rating: 5,
    order: 2,
  },
  {
    id: '3',
    name: 'Artikel Jurnal SINTA 2 (Terbit & Bebas Revisi)',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    order: 3,
  },
  {
    id: '4',
    name: 'Tugas Teknik: Coding & Analisis Struktur (Nilai A)',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    order: 4,
  },
];

export const defaultConfig: SiteConfig = {
  whatsappNumber: '6285861950414',
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

// Helpers for reading/writing with Vercel Blob support
async function readBlobJson<T>(key: string, defaultValue: T): Promise<T> {
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (hasBlob) {
    try {
      const { blobs } = await list({ prefix: `db/${key}` });
      if (blobs.length > 0) {
        const sorted = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        const res = await fetch(sorted[0].url, { cache: 'no-store' });
        if (res.ok) {
          const val = (await res.json()) as T;
          globalMemoryCache[key] = val;
          return val;
        }
      }
    } catch (err) {
      console.warn(`[Vercel Blob] Read warning for ${key}:`, err);
    }
  }

  // 2. Memory cache check
  if (globalMemoryCache[key] !== undefined) {
    return globalMemoryCache[key] as T;
  }

  // 3. Local fallback
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const val = JSON.parse(content);
      globalMemoryCache[key] = val;
      return val;
    }
  } catch {
    // silent catch
  }

  return defaultValue;
}

async function writeBlobJson<T>(key: string, data: T): Promise<void> {
  // Simpan ke in-memory cache
  globalMemoryCache[key] = data;
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Try Vercel Blob (supports token or OIDC BLOB_STORE_ID)
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (hasBlob) {
    try {
      // Simpan file baru dengan random suffix agar tidak pernah throw BlobAlreadyExistsError
      const newBlob = await put(`db/${key}.json`, jsonStr, {
        access: 'public',
        addRandomSuffix: true,
      });

      // Hapus blob versi lama agar storage selalu bersih dan rapi
      try {
        const { blobs } = await list({ prefix: `db/${key}` });
        const oldBlobs = blobs.filter((b) => b.url !== newBlob.url);
        if (oldBlobs.length > 0) {
          await del(oldBlobs.map((b) => b.url));
        }
      } catch {}

      return;
    } catch (err) {
      console.warn(`[Vercel Blob] Write warning for ${key}:`, err);
    }
  }

  // 2. Maintain local/tmp copy if possible
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${key}.json`);
    fs.writeFileSync(filePath, jsonStr);
  } catch {
    // silent catch on read-only environments
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
  const index = services.findIndex((s) => s.id === id);
  if (index === -1) return null;
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

export async function deleteTestimonial(id: string): Promise<boolean> {
  const testimonials = await getTestimonials();
  const filtered = testimonials.filter((t) => t.id !== id);
  if (filtered.length === testimonials.length) return false;
  await saveTestimonials(filtered);
  return true;
}

// ================= Config API =================
export async function getConfig(): Promise<SiteConfig> {
  return await readBlobJson<SiteConfig>('config', defaultConfig);
}

export async function saveConfig(config: SiteConfig): Promise<void> {
  await writeBlobJson('config', config);
}
