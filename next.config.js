/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
  },
  images: {
    remotePatterns: [
      // Cloudinary (provider utama untuk gambar baru)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Vercel Blob (dipertahankan agar gambar lama tetap tampil)
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;
