# DESIGN.md --- Bryz Academic Support

> Dokumen ini adalah sumber utama arahan visual dan pengalaman pengguna
> untuk website Bryz Academic Support. Semua implementasi UI baru maupun
> redesign harus mengikuti pedoman ini. Jika ada konflik antara pola
> komponen lama dan pedoman ini, prioritaskan pedoman ini tanpa
> menghilangkan fungsi bisnis yang sudah berjalan.

## 1. Brand foundation

### Brand positioning

Bryz Academic Support adalah layanan pendampingan dan asistensi akademik
terpercaya untuk berbagai jenjang pendidikan dan kebutuhan karya ilmiah.
Website harus membangun rasa percaya, profesionalisme, ketenangan,
dan kemudahan untuk berkonsultasi.

### Brand personality

-   **Thoughtful:** memahami kebutuhan dan tantangan klien dalam menyelesaikan tugas dan karya ilmiah.
-   **Credible:** rapi, jelas, transparan, dan profesional.
-   **Contemporary:** modern tanpa mengikuti tren visual secara
    berlebihan.
-   **Approachable:** ramah, terbuka, hangat, dan mudah diajak
    berdiskusi.

### Design concept

**Premium Editorial Academic --- Mixed Theme**

Gunakan pendekatan editorial modern: tipografi berkarakter, komposisi
asimetris yang terkontrol, whitespace yang cukup, foto editorial
relevan, dan pergantian section terang-gelap. Website tidak boleh terasa
seperti template SaaS generik atau dashboard.

Tagline yang dapat digunakan sebagai arahan copy: **"Your academic
journey, thoughtfully supported."** Jangan mengganti tagline atau copy
bisnis yang sudah disetujui tanpa izin.

## 2. Visual direction

### Prinsip utama

1.  Bangun hierarki visual melalui tipografi, skala, alignment, dan
    ruang kosong.
2.  Gunakan layout asimetris secara terencana, bukan sekadar menggeser
    elemen.
3.  Setiap section harus memiliki komposisi dan tujuan visual yang
    jelas.
4.  Gunakan foto atau ilustrasi yang benar-benar relevan dengan konteks
    akademik.
5.  Jangan mengubah semua konten menjadi card.
6.  Hindari dekorasi yang tidak memiliki fungsi atau makna.
7.  Desain harus terasa konsisten sebagai satu brand dari navbar hingga
    footer.

### Color palette

  Token          HEX         Penggunaan
  -------------- ----------- --------------------------------------
  Ink / Slate    `#0F172A`   Teks utama dan heading mode terang
  Deep Slate     `#0A0F1D`   Background dark mode utama
  Slate-50       `#F8FAFC`   Background terang utama (clean & modern canvas)
  Paper          `#FFFFFF`   Surface card, form, dan kontainer konten
  Royal Blue     `#2563EB`   Aksen brand modern, link, dan status aktif
  Soft Slate     `#F1F5F9`   Surface sekunder, border pemisah, dan tab container
  Muted Slate    `#475569`   Teks sekunder dan deskripsi
  Gold / Amber   `#D97706`   Aksen rating bintang dan badge mutu
  Border Light   `#E2E8F0`   Border presisi pada tema terang
  Border Dark    `#1E293B`   Border presisi pada tema gelap
  Success        `#10B981`   Status berhasil dan aksi WhatsApp
  Danger         `#EF4444`   Status kesalahan

Aturan warna:
- Bersih & Modern: Menggunakan kanvas `#FFFFFF` dan `#F8FAFC` dengan border `#E2E8F0` yang jernih tanpa kesan kusam/vintage.
- Dark & Light Adaptif: Mode terang murni cerah dan bersih tanpa blok gelap permanen. Mode gelap murni deep slate (`#0A0F1D` / `#111827`) saat diaktifkan oleh pengguna.
- Royal Blue (`#2563EB`) adalah aksen utama modern. Amber (`#D97706`) adalah aksen sekunder terukur.
- WhatsApp menggunakan Emerald (`#10B981`) yang segar dan mudah diidentifikasi.
- Kontras teks memenuhi standar WCAG AA. Bebas dari gradien ungu/pink generik atau dekorasi tanpa makna.

## 3. Typography

Gunakan maksimal dua keluarga font: - **Display / heading:**
`Plus Jakarta Sans` atau font display sans-serif sejenis dengan karakter
tegas. - **Body / UI:** `Inter` atau sans-serif yang sangat mudah
dibaca.

Jika font tersebut belum tersedia, gunakan font yang sudah ada di
project atau fallback sans-serif. Hindari menambahkan dependency font
baru tanpa memeriksa konfigurasi project.

Pedoman hierarki desktop: - Display hero: clamp sekitar 3.5rem--5.5rem,
line-height 0.95--1.05. - H1 section/page: 2.5rem--3.5rem. - H2:
2rem--2.75rem. - H3: 1.25rem--1.5rem. - Body utama: 1rem--1.125rem,
line-height 1.6--1.75. - Caption/eyebrow: 0.75rem--0.875rem, gunakan
tracking seperlunya.

Aturan: - Heading harus memiliki line-length yang terkendali. - Gunakan
font weight 600--750 untuk heading; jangan membuat semua teks bold. -
Hindari paragraf terlalu lebar. Batasi lebar bacaan sekitar 60--75
karakter per baris. - Italic boleh digunakan sebagai aksen editorial,
bukan untuk seluruh heading. - Jangan menggunakan terlalu banyak ukuran
font yang berbeda.

## 4. Layout and spacing

-   Gunakan container konsisten dengan lebar maksimum sekitar
    1200--1280px.
-   Padding horizontal desktop sekitar 5--7vw; tablet 24--32px; mobile
    18--22px.
-   Gunakan sistem spacing berbasis kelipatan 4 atau 8.
-   Jarak antar-section desktop umumnya 96--144px; mobile 64--88px.
-   Gunakan grid 12 kolom atau CSS grid yang setara untuk komposisi
    desktop.
-   Variasikan alignment: left-aligned editorial, split layout, dan
    grid. Jangan memusatkan semua section.
-   Pastikan konten tidak menempel pada tepi viewport.
-   Gunakan whitespace untuk membangun fokus, bukan membiarkan hero
    kosong tanpa tujuan.

## 5. Imagery and graphic language

Prioritaskan foto editorial autentik atau aset visual yang memiliki
lisensi dan kualitas memadai: - Meja kerja mahasiswa dengan laptop dan
dokumen penelitian. - Buku, catatan, jurnal, dan materi akademik. -
Aktivitas membaca, menulis, atau berdiskusi. - Detail close-up proses
belajar dan penelitian.

Aturan gambar: - Pilih foto dengan pencahayaan natural, tone
hangat/netral, dan komposisi yang punya ruang untuk teks bila
diperlukan. - Gunakan crop yang disengaja dan konsisten. - Jangan
memakai gambar stok klise seperti orang berjabat tangan atau tim kantor
tanpa konteks. - Jangan membuat gambar palsu yang seolah-olah
menunjukkan klien, hasil, atau testimoni nyata. - Jangan menggunakan
emoji sebagai ilustrasi utama. - Jika aset belum tersedia, gunakan
placeholder visual yang rapi dan mudah diganti; jangan mengarang URL
gambar.

Elemen grafis pendukung boleh mencakup garis tipis, nomor section, label
kecil uppercase, bentuk geometris sederhana, dan kutipan besar. Gunakan
seperlunya.

## 6. Theme system: mixed light and dark

Website menggunakan pergantian section terang dan gelap yang disengaja,
bukan dark mode acak per komponen.

Urutan yang direkomendasikan: 1. Navbar: paper/ivory. 2. Hero: ivory. 3.
Trust indicators: paper atau ivory. 4. Layanan: paper. 5. Keunggulan:
deep navy. 6. Pricelist: ivory/paper. 7. Proses kerja: soft blue atau
paper. 8. Testimoni: deep navy atau navy. 9. FAQ: ivory. 10. CTA: deep
navy. 11. Footer: deep navy.

Setiap pergantian tema harus memiliki transisi visual yang jelas.
Komponen di dalam section wajib mengikuti token tema section tersebut.
Jangan menempatkan card putih tanpa alasan di atas section terang atau
komponen gelap tanpa kontras di section navy.

Jika toggle light/dark sudah ada, pertahankan fungsinya dan pastikan
semua komponen benar-benar mengikuti theme tokens. Jangan menghapus
kontrol tema yang sudah tersedia.

## 7. Component design

### Navbar

-   Tinggi sekitar 72--84px pada desktop.
-   Logo/wordmark harus jelas dan mudah dikenali.
-   Navigasi tidak terlalu rapat dan memiliki hover/focus state yang
    jelas.
-   CTA WhatsApp menjadi aksen utama, tetapi tidak mendominasi.
-   Mobile navigation harus mudah digunakan dengan keyboard dan touch.
-   Sticky navbar hanya jika implementasi dan UX-nya memang mendukung.

### Hero

-   Gunakan split composition: copy di satu sisi dan visual editorial di
    sisi lain.
-   Eyebrow kecil dapat memperkenalkan layanan atau positioning.
-   Headline singkat, kuat, dan mudah dipindai.
-   Batasi deskripsi menjadi 2--3 baris desktop bila memungkinkan.
-   Sediakan satu primary CTA dan satu secondary CTA.
-   Trust points ditempatkan dekat hero, tetapi jangan membuat tiga card
    besar yang seragam.
-   Jangan mengubah klaim bisnis seperti "bebas plagiarisme", "garansi
    sampai ACC", atau klaim hasil lainnya tanpa validasi pemilik bisnis.
    Jangan memperkuat klaim yang tidak dapat dibuktikan.

### Service section

-   Gunakan editorial grid dengan variasi ukuran item.
-   Tampilkan nama layanan, ringkasan, dan tindakan yang relevan.
-   Hindari setiap layanan memiliki card identik jika hierarki kontennya
    berbeda.
-   Pastikan semua layanan yang sudah tersedia tetap ditampilkan.

### Advantages / trust section

-   Gunakan background navy.
-   Gunakan heading kontras tinggi, angka atau label editorial, dan
    penjelasan singkat.
-   Hindari dekorasi berlebihan dan klaim tanpa dasar.
-   Ikon harus konsisten, sederhana, dan berasal dari library ikon yang
    sudah digunakan.

### Pricelist

-   Informasi harga harus mudah dibandingkan dan dipindai.
-   Prioritaskan tabel, daftar terstruktur, atau kelompok harga daripada
    grid card yang berlebihan.
-   Tonjolkan harga dan cakupan layanan dengan hierarki yang jelas.
-   Jangan mengubah nominal, satuan, paket, atau ketentuan harga.
-   Pastikan tampilan mobile tidak menyebabkan tabel terpotong; gunakan
    layout adaptif.

### Process section

-   Gunakan empat langkah atau jumlah langkah yang memang sesuai proses
    bisnis.
-   Tampilkan urutan dengan nomor, garis penghubung, atau timeline.
-   Jangan mengarang tahapan operasional yang belum dikonfirmasi.

### Testimonials

-   Gunakan kutipan besar dan layout editorial.
-   Nama, foto, institusi, dan isi testimoni hanya boleh berasal dari
    data asli yang tersedia dan telah disetujui.
-   Jangan membuat testimoni fiktif untuk mengisi layout.

### FAQ

-   Gunakan accordion yang jelas dan mudah diakses.
-   Tampilkan indikator expand/collapse yang konsisten.
-   Pastikan jawaban yang sudah ada tidak berubah maknanya.

### CTA and footer

-   CTA akhir menggunakan deep navy dengan headline singkat dan tombol
    WhatsApp yang menonjol.
-   Footer memuat identitas, navigasi penting, dan informasi kontak yang
    benar.
-   Jangan mengarang alamat, jam operasional, nomor, atau tautan.

### Floating actions: WhatsApp and QRIS

-   Pertahankan kedua fungsi yang sudah ada.
-   Jangan biarkan tombol menghalangi konten, navigasi mobile, atau
    elemen penting.
-   Pertimbangkan satu launcher/stack yang rapi pada desktop dan mobile.
-   Ukuran, jarak, label, dan z-index harus diuji di viewport kecil.
-   Gunakan hijau hanya untuk WhatsApp; QRIS dapat menggunakan aksen
    netral/brand.

### Buttons, forms, and cards

-   Button primary: royal blue atau WhatsApp green sesuai konteks
    tindakan.
-   Button secondary: outline atau surface kontras.
-   Radius komponen moderat, sekitar 8--14px; hindari semua elemen
    berbentuk pill.
-   Shadow tipis dan fungsional; jangan memberi shadow besar pada setiap
    card.
-   Form memiliki label yang terlihat, pesan validasi jelas, dan focus
    ring yang mudah dikenali.
-   Card digunakan untuk mengelompokkan informasi yang memang perlu
    dipisahkan, bukan sebagai default seluruh layout.

## 8. Interaction and motion

-   Gunakan transisi sekitar 150--250ms untuk hover/focus.
-   Gerakan harus membantu orientasi dan feedback, bukan sekadar
    dekorasi.
-   Hormati `prefers-reduced-motion`.
-   Sediakan hover, focus-visible, active, disabled, loading, success,
    dan error states.
-   Semua kontrol interaktif harus dapat digunakan dengan keyboard.
-   Jangan membuat elemen terlihat clickable jika tidak memiliki
    tindakan.
-   Jangan menambahkan parallax atau animasi berat tanpa alasan UX yang
    jelas.

## 9. Responsive behavior

### Desktop

-   Manfaatkan split layout dan editorial grid.
-   Jaga lebar teks agar mudah dibaca.
-   Hindari hero yang terlalu tinggi atau whitespace kosong yang tidak
    disengaja.

### Tablet

-   Kurangi jumlah kolom dan rapikan jarak.
-   Pastikan visual dan teks tetap seimbang.
-   Hindari ukuran heading desktop yang tidak turun secara proporsional.

### Mobile

-   Ubah split layout menjadi urutan vertikal yang logis.
-   Heading harus tetap kuat tetapi tidak memenuhi seluruh layar.
-   CTA dapat menjadi full-width bila membantu.
-   Navigasi, accordion, tabel harga, dan floating actions harus nyaman
    disentuh.
-   Tidak boleh ada horizontal overflow.
-   Jangan hanya mengecilkan layout desktop; susun ulang berdasarkan
    prioritas konten.

## 10. Content and copywriting

-   Gunakan bahasa Indonesia yang natural, jelas, dan meyakinkan.
-   Hindari jargon berlebihan, kalimat bombastis, dan frasa generik AI.
-   Gunakan paragraf pendek dan subheading informatif.
-   Utamakan kejelasan layanan, proses, harga, dan cara konsultasi.
-   Jangan menjanjikan hasil akademik, kelulusan, nilai, atau
    persetujuan tanpa dasar.
-   Pertahankan konten bisnis yang ada kecuali ada persetujuan
    perubahan.

## 11. Accessibility and usability

-   Gunakan semantic HTML yang tepat.
-   Sediakan alt text yang bermakna untuk gambar informatif; gambar
    dekoratif menggunakan alt kosong.
-   Jaga kontras warna teks dan komponen.
-   Gunakan label form yang terhubung dengan input.
-   Pastikan focus state terlihat.
-   Jangan mengandalkan warna saja untuk menyampaikan status.
-   Target area sentuh ideal sekitar 44×44px.
-   Pastikan heading hierarchy logis dan urutan tab masuk akal.

## 12. Technical implementation rules

-   Pertahankan stack, arsitektur, package, dan pola komponen yang sudah
    digunakan project.
-   Sebelum mengubah file, periksa struktur project, komponen existing,
    routing, data, dan integrasi.
-   Reuse komponen dan design tokens; hindari duplikasi.
-   Jangan mengganti library atau menambah dependency tanpa kebutuhan
    yang jelas.
-   Jangan menghapus atau merusak integrasi WhatsApp, QRIS, navigasi,
    formulir, atau fitur yang sudah berjalan.
-   Jangan mengubah data layanan, harga, testimoni, FAQ, kontak, dan
    konten bisnis tanpa persetujuan.
-   Jangan membuat tautan, data, statistik, atau aset palsu.
-   Jaga TypeScript tetap type-safe dan hindari `any` tanpa alasan kuat.
-   Jangan meninggalkan placeholder, TODO, console log, atau kode mati
    pada hasil final.
-   Pastikan tidak ada hydration error, broken image, error console,
    atau layout shift yang tidak perlu.

## 13. Anti-Slop checklist

Sebelum menyatakan UI selesai, lakukan pemeriksaan berikut:

### Visual quality

-   [ ] Desain tidak terlihat seperti template SaaS generik.
-   [ ] Hero memiliki focal point dan komposisi yang jelas.
-   [ ] Tipografi memiliki hierarchy yang konsisten.
-   [ ] Tidak semua section menggunakan pola card yang sama.
-   [ ] Warna digunakan sesuai peran dan tema.
-   [ ] Foto/ilustrasi relevan dan berkualitas.
-   [ ] Whitespace terasa disengaja, bukan ruang kosong tanpa fungsi.
-   [ ] Setiap section memiliki variasi visual tetapi tetap satu
    identitas brand.

### UX and responsive

-   [ ] Semua CTA dan navigasi berfungsi.
-   [ ] WhatsApp dan QRIS tetap dapat diakses.
-   [ ] Tidak ada horizontal overflow pada mobile.
-   [ ] Form, accordion, dan menu dapat digunakan dengan keyboard.
-   [ ] Focus, hover, loading, error, dan disabled states tersedia.
-   [ ] Kontras dan ukuran touch target memadai.

### Content and engineering

-   [ ] Tidak ada klaim, testimoni, harga, atau data yang dikarang.
-   [ ] Konten penting dan fitur lama tetap terjaga.
-   [ ] Tidak ada error TypeScript/build/console yang diketahui.
-   [ ] Tidak ada dependency atau abstraksi yang ditambahkan tanpa
    kebutuhan.

Jika ada checklist yang gagal, perbaiki sebelum menyatakan pekerjaan
selesai. Jika tidak dapat diperbaiki, jelaskan secara eksplisit.

## 14. Workflow for AI agents

Untuk setiap pekerjaan UI:

1.  Baca `DESIGN.md` dan aturan Anti-Slop yang tersedia.
2.  Audit halaman dan komponen terkait sebelum coding.
3.  Identifikasi konten, fungsi, dan integrasi yang tidak boleh berubah.
4.  Buat rencana implementasi singkat yang menyebutkan section,
    komponen, dan perubahan visual.
5.  Implementasikan desain mengikuti pedoman ini.
6.  Jalankan lint, typecheck, dan build yang tersedia di project.
7.  Periksa tampilan desktop, tablet, dan mobile.
8.  Audit ulang menggunakan checklist Anti-Slop.
9.  Laporkan file yang berubah, pemeriksaan yang dijalankan, hasilnya,
    dan hal yang belum terselesaikan.

### Final principle

**Bryz harus terasa seperti brand pendamping akademik premium yang punya
identitas editorial sendiri --- bukan template landing page AI yang
hanya diganti warna dan teksnya.**
