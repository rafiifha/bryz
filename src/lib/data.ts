import { Service, Testimonial, SiteConfig } from './types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { put, list } from '@vercel/blob';

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
    description: 'Bimbingan dan pengerjaan skripsi lengkap dari Bab 1 hingga Bab 5. Termasuk olah data SPSS/PLS/Python, parafrase anti-plagiarisme, hingga bebas revisi sampai ACC sidang.',
    price: 'Mulai Rp 1.500.000 / Konsultasi',
    icon: '📚',
    imageUrl: null,
    order: 1,
  },
  {
    id: '2',
    name: 'Proposal Skripsi',
    description: 'Penyusunan proposal skripsi terstruktur sesuai buku pedoman kampus. Mulai dari latar belakang masalah, identifikasi masalah, kajian teori, hingga metodologi penelitian komprehensif.',
    price: 'Mulai Rp 500.000 / Konsultasi',
    icon: '📋',
    imageUrl: null,
    order: 2,
  },
  {
    id: '3',
    name: 'Artikel Ilmiah & Jurnal',
    description: 'Penulisan artikel ilmiah standar jurnal nasional terakreditasi (SINTA 1 - 6) hingga internasional (Scopus/WoS). Format IMRAD lengkap dengan sitasi Mendeley / Zotero.',
    price: 'Mulai Rp 450.000 / Konsultasi',
    icon: '📰',
    imageUrl: null,
    order: 3,
  },
  {
    id: '4',
    name: 'Makalah Akademik',
    description: 'Pembuatan makalah mata kuliah dengan argumentasi mendalam, analisis kritis, dan referensi jurnal terkini (maks 5 tahun terakhir). Rapi, cepat, dan siap presentasi.',
    price: 'Mulai Rp 100.000 / Konsultasi',
    icon: '📝',
    imageUrl: null,
    order: 4,
  },
  {
    id: '5',
    name: 'Esai & Opini',
    description: 'Penulisan esai beasiswa (LPDP, AAS, IISMA), esai lomba, hingga esai tugas kuliah. Diksi persuasif, terstruktur, orisinil, dan memikat pembaca.',
    price: 'Mulai Rp 75.000 / Konsultasi',
    icon: '✍️',
    imageUrl: null,
    order: 5,
  },
  {
    id: '6',
    name: 'Paper & Review Jurnal',
    description: 'Pembuatan scientific paper, critical appraisal, dan literature review multi-jurnal. Pembahasan tajam dan metodologis dengan referensi terindeks bereputasi.',
    price: 'Mulai Rp 200.000 / Konsultasi',
    icon: '🔬',
    imageUrl: null,
    order: 6,
  },
  {
    id: '7',
    name: 'Tugas Teknik (Engineering)',
    description: 'Pengerjaan tugas teknik spesifik: Teknik Informatika/Sistem Informasi (Coding, Web, App), Teknik Sipil & Mesin (AutoCAD, SAP2000, Analisis Struktur), serta Teknik Elektro (MATLAB, IoT).',
    price: 'Mulai Rp 150.000 / Sesuai Kerumitan',
    icon: '⚙️',
    imageUrl: null,
    order: 7,
  },
];

export const defaultTestimonials: Testimonial[] = [];

export const defaultConfig: SiteConfig = {
  whatsappNumber: '6281234567890',
  heroTitle: 'Solusi Akademik Cepat & Berkualitas untuk Masa Depanmu',
  heroDescription: 'Bryz Academic Support siap mendampingi perjalanan akademikmu mulai dari tugas harian, esai, paper, jurnal, tugas teknik hingga skripsi tuntas bergaransi.',
  totalClients: '1.250+',
  totalProjects: '3.400+',
  satisfaction: '99.4%',
  qrisImageUrl: null,
  logoImageUrl: null,
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
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    try {
      const { blobs } = await list({ prefix: `db/${key}.json`, token });
      if (blobs.length > 0) {
        const sorted = blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
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
  if (globalMemoryCache[key]) {
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

  // 1. Try Vercel Blob if token is set
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    try {
      await put(`db/${key}.json`, jsonStr, {
        access: 'public',
        addRandomSuffix: false,
        token,
      });
      return; // Berhasil disimpan ke Cloud Vercel Blob, tidak perlu menyentuh filesystem
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
