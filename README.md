# Bryz Academic Support — Platform Jasa Bantuan Akademik

Website modern, clean, dan profesional untuk layanan bantuan akademik (**Bryz Academic Support**), dirancang khusus untuk skripsi, proposal, artikel ilmiah, makalah, esai, paper, dan tugas teknik.

Dibangun dengan **Next.js (App Router)**, **Vercel Blob** untuk penyimpanan database & screenshot testimoni, serta panel admin lengkap.

---

## 🌟 Fitur Utama

1. **Landing Page Modern & Clean (Dual Theme: Light & Dark Mode)**
   - Opsi tampilan **Dark Mode** dan **Light Mode** instan dengan tombol toggle matahari/bulan (☀️ / 🌙) di navbar.
   - Pilihan tema tersimpan otomatis di `localStorage` dan mendeteksi preferensi tema sistem secara cerdas.
   - Efek *glassmorphism*, glowing gradient, dan animasi halus yang dinamis di kedua tema.
   - Hero section interaktif dengan badge ketersediaan order dan statistik klien.
   - Grid layanan lengkap dengan ikon, deskripsi mendalam, estimasi harga, dan tombol konsultasi.
   - **Open Pricelist Interaktif**: Tabel daftar harga transparan dengan filter kategori (Skripsi, Karya Ilmiah, Tugas Teknik).
   - **SS Testimoni Klien**: Galeri screenshot testimoni asli dengan fitur **Lightbox Zoom** resolusi penuh saat diklik.
   - **Keunggulan & Trust Factors**: 100% Rahasia, Anti-Plagiarisme / Turnitin aman, Garansi revisi sampai ACC, Tim profesional.
   - **Alur Pemesanan 4 Langkah**: Panduan mudah dari konsultasi gratis hingga serah terima file.
   - **FAQ Accordion**: Tanya jawab umum seputar privasi, revisi, turnitin, dan pembayaran.
   - **Floating WhatsApp Button**: Tombol chat admin WhatsApp melayang dengan animasi pulse.

2. **Database Vercel Blob & Local Fallback**
   - Menggunakan `@vercel/blob` untuk penyimpanan dokumen JSON data layanan, testimoni, dan konfigurasi.
   - Menyimpan upload screenshot testimoni dan foto layanan langsung ke Vercel Blob CDN.
   - Memiliki fallback otomatis ke penyimpanan file lokal (`data/` & `public/uploads/`) saat dijalankan di komputer lokal tanpa token.

3. **Role Admin Panel (`/admin`)**
   - **Autentikasi Aman**: Login berbasis token password admin.
   - **Kelola Layanan (Jenis Joki)**:
     - Tambah jenis joki baru (Nama, Deskripsi, Harga, Ikon, Upload Gambar).
     - Edit deskripsi jenis joki, ubah harga, dan perbarui gambar.
     - Hapus jenis joki.
   - **Kelola SS Testimoni**:
     - Unggah screenshot testimoni chat / hasil ACC dosen.
     - Atur rating bintang (1 - 5).
     - Hapus testimoni yang tidak diinginkan.
   - **Pengaturan Website**:
     - Ubah nomor WhatsApp admin yang terhubung ke semua tombol order.
     - Ubah headline hero dan deskripsi.
     - Ubah statistik total klien, tugas selesai, dan tingkat kepuasan.

---

## 🚀 Panduan Menjalankan di Lokal

### 1. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 2. Akses Panel Admin
- Kunjungi: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Password Default**: `bryz2024admin`
*(Dapat diubah melalui file `.env.local` pada variabel `ADMIN_PASSWORD`)*

---

## ☁️ Panduan Deploy ke Vercel & Setup Vercel Blob

1. Push proyek ini ke repository GitHub Anda.
2. Impor project ke dashboard [Vercel](https://vercel.com).
3. Di dashboard Vercel:
   - Masuk ke tab **Storage** -> Klik **Create Database** -> Pilih **Blob**.
   - Hubungkan Blob Store tersebut ke proyek Anda.
   - Vercel akan secara otomatis mengisi environment variable `BLOB_READ_WRITE_TOKEN`.
4. Tambahkan environment variable di menu **Settings -> Environment Variables**:
   - `ADMIN_PASSWORD`: Isi dengan password rahasia untuk login admin Anda.
5. Selesai! Website Anda siap melayani pemesanan secara online 24/7.
