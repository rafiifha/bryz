'use client';

import { useState, useEffect } from 'react';
import { Service, Testimonial, SiteConfig } from '@/lib/types';
import { groupTestimonialsByMonth } from '@/lib/testimonialMonth';
import ThemeToggle from './ThemeToggle';

interface LandingPageProps {
  services: Service[];
  testimonials: Testimonial[];
  config: SiteConfig;
}

export default function LandingPage({
  services: initialServices,
  testimonials: initialTestimonials,
  config: initialConfig,
}: LandingPageProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [config, setConfig] = useState<SiteConfig>({
    ...initialConfig,
    whatsappNumber: initialConfig?.whatsappNumber || '6285861950414',
    whatsappNumber2: initialConfig?.whatsappNumber2 || '6281395866659',
  });

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  // Every month starts collapsed; only one month is open at a time.
  const [openTestimonialMonth, setOpenTestimonialMonth] = useState<string | null>(null);
  const [showQrisModal, setShowQrisModal] = useState<boolean>(false);
  const [showWaSelector, setShowWaSelector] = useState<boolean>(false);
  const [pendingWaText, setPendingWaText] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Aksesibilitas (Antislop R-32): Tutup modal dan menu mobile dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQrisModal(false);
        setPreviewImage(null);
        setMobileMenuOpen(false);
        setShowWaSelector(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sinkronisasi data real-time dengan Admin
  useEffect(() => {
    let hasLocalConfig = false;
    let hasLocalTestimonials = false;
    let hasLocalServices = false;

    // 1. Cek local storage untuk update instan
    try {
      const localConf = localStorage.getItem('bryz_site_config');
      if (localConf) {
        const parsed = JSON.parse(localConf);
        setConfig((prev) => ({
          ...prev,
          ...parsed,
          whatsappNumber: parsed.whatsappNumber || prev.whatsappNumber || '6285861950414',
          whatsappNumber2: parsed.whatsappNumber2 || prev.whatsappNumber2 || '6281395866659',
        }));
        hasLocalConfig = true;
      }
      const localTest = localStorage.getItem('bryz_testimonials');
      if (localTest) {
        try {
          const parsed = JSON.parse(localTest);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTestimonials(parsed);
            hasLocalTestimonials = true;
          }
        } catch {}
      }
      const localServ = localStorage.getItem('bryz_services');
      if (localServ) {
        setServices(JSON.parse(localServ));
        hasLocalServices = true;
      }
    } catch {}

    // Listener real-time sinkronisasi antar-tab saat admin melakukan edit
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'bryz_services' && e.newValue) {
        try { setServices(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'bryz_site_config' && e.newValue) {
        try { setConfig(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'bryz_testimonials' && e.newValue) {
        try { setTestimonials(JSON.parse(e.newValue)); } catch {}
      }
    };

    const handleCustomSync = () => {
      try {
        const ls = localStorage.getItem('bryz_services');
        if (ls) setServices(JSON.parse(ls));
        const lc = localStorage.getItem('bryz_site_config');
        if (lc) setConfig(JSON.parse(lc));
        const lt = localStorage.getItem('bryz_testimonials');
        if (lt) setTestimonials(JSON.parse(lt));
      } catch {}
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('bryz_services_updated', handleCustomSync);
    window.addEventListener('bryz_config_updated', handleCustomSync);
    window.addEventListener('bryz_testimonials_updated', handleCustomSync);

    // 2. Fetch live data dari API backend & status blob
    Promise.all([
      fetch('/api/services', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/testimonials', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/config', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/status', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
    ])
      .then(([s, t, c, st]) => {
        const isBlobActive = Boolean(st?.blobConnected);

        if (Array.isArray(s) && s.length > 0) {
          if (isBlobActive || !hasLocalServices) {
            setServices(s);
            try { localStorage.setItem('bryz_services', JSON.stringify(s)); } catch {}
          }
        }
        if (Array.isArray(t) && (isBlobActive || !hasLocalTestimonials)) {
          setTestimonials(t);
        }
        if (c && typeof c === 'object') {
          const cleanConfig: SiteConfig = {
            ...c,
            whatsappNumber: c.whatsappNumber || '6285861950414',
            whatsappNumber2: c.whatsappNumber2 || '6281395866659',
          };
          if (isBlobActive) {
            setConfig(cleanConfig);
            try { localStorage.setItem('bryz_site_config', JSON.stringify(cleanConfig)); } catch {}
          } else {
            setConfig((prev) => {
              const updated: SiteConfig = {
                ...cleanConfig,
                ...prev, // Data yang diedit di admin lokal tidak tertimpa default server
                logoImageUrl: prev.logoImageUrl || cleanConfig.logoImageUrl,
                qrisImageUrl: prev.qrisImageUrl || cleanConfig.qrisImageUrl,
                whatsappNumber: (hasLocalConfig && prev.whatsappNumber) ? prev.whatsappNumber : cleanConfig.whatsappNumber,
                whatsappNumber2: (hasLocalConfig && prev.whatsappNumber2) ? prev.whatsappNumber2 : cleanConfig.whatsappNumber2,
              };
              try { localStorage.setItem('bryz_site_config', JSON.stringify(updated)); } catch {}
              return updated;
            });
          }
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('bryz_services_updated', handleCustomSync);
      window.removeEventListener('bryz_config_updated', handleCustomSync);
      window.removeEventListener('bryz_testimonials_updated', handleCustomSync);
    };
  }, []);

  const waNumber1 = config.whatsappNumber || '6285861950414';
  const waNumber2 = config.whatsappNumber2 || '6281395866659';
  const hasSecondWa = !!(waNumber2 && waNumber2.length >= 10);

  const buildWaUrl = (number: string, text: string) =>
    `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  const defaultWaText = 'Halo Admin Bryz Academic Support, saya ingin konsultasi pengerjaan tugas akademik saya. Mohon infonya ya!';
  const waLink1 = buildWaUrl(waNumber1, defaultWaText);
  const waLink2 = buildWaUrl(waNumber2, defaultWaText);

  const getWaLink = (serviceName?: string) => {
    const text = serviceName
      ? `Halo Admin Bryz Academic Support, saya ingin konsultasi pengerjaan *${serviceName}*. Boleh info estimasi pengerjaan, syarat, dan harganya?`
      : defaultWaText;
    return buildWaUrl(waNumber1, text);
  };

  /** Ketika ada 2 nomor WA, buka selector. Kalau cuma 1, langsung buka WA. */
  const handleWaClick = (e: React.MouseEvent, text?: string) => {
    if (!hasSecondWa) return; // biarkan <a> berjalan biasa
    e.preventDefault();
    const waText = text || defaultWaText;
    setPendingWaText(waText);
    setShowWaSelector(true);
  };

  const openWa = (number: string) => {
    window.open(buildWaUrl(number, pendingWaText || defaultWaText), '_blank', 'noopener,noreferrer');
    setShowWaSelector(false);
  };

  const defaultWaLink = waLink1;

  const getCategoryFromService = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('skripsi') || lower.includes('proposal')) return 'Skripsi & Proposal';
    if (lower.includes('artikel') || lower.includes('jurnal')) return 'Publikasi Ilmiah';
    if (lower.includes('makalah') || lower.includes('esai') || lower.includes('paper') || lower.includes('policy') || lower.includes('brief')) return 'Karya Tulis';
    if (lower.includes('teknik') || lower.includes('coding')) return 'Tugas Teknik';
    return 'Akademik';
  };

  const getEstimatedTime = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('skripsi') || lower.includes('proposal')) return '5 - 14 Hari (Fleksibel)';
    if (lower.includes('artikel') || lower.includes('jurnal')) return '3 - 5 Hari';
    if (lower.includes('teknik')) return '2 - 5 Hari / Kilat';
    if (lower.includes('policy') || lower.includes('brief')) return '1 - 2 Hari / Kilat';
    return '1 - 3 Hari (Bisa Kilat)';
  };

  const getFeatures = (name: string): string[] => {
    const lower = name.toLowerCase();
    if (lower.includes('skripsi') || lower.includes('proposal')) {
      return ['Garansi revisi sampai ACC', 'Lolos cek Turnitin < 15%', 'Bimbingan & Olah Data'];
    }
    if (lower.includes('artikel') || lower.includes('jurnal')) {
      return ['Format Standar Jurnal / SINTA', 'Sitasi Mendeley / Zotero', 'Bebas Plagiasi'];
    }
    if (lower.includes('teknik')) {
      return ['Kode/Perhitungan Terverifikasi', 'Source code & Dokumentasi', 'Testing & Konsultasi'];
    }
    if (lower.includes('policy') || lower.includes('brief')) {
      return ['Format Padat & To-The-Point', 'Rangkuman Analisis Isu', 'Rekomendasi Solusi Praktis'];
    }
    return ['Bebas Plagiarisme', 'Referensi Jurnal Terkini', 'Garansi Revisi Gratis'];
  };

  const filteredServices = services.filter((service) => {
    if (selectedCategory === 'all') return true;
    const cat = (service.category || getCategoryFromService(service.name)).toLowerCase();
    if (selectedCategory === 'skripsi') return cat.includes('skripsi') || cat.includes('proposal') || service.name.toLowerCase().includes('skripsi') || service.name.toLowerCase().includes('proposal');
    if (selectedCategory === 'ilmiah') return cat.includes('publikasi') || cat.includes('karya') || cat.includes('ilmiah') || service.name.toLowerCase().includes('artikel') || service.name.toLowerCase().includes('jurnal') || service.name.toLowerCase().includes('makalah') || service.name.toLowerCase().includes('esai') || service.name.toLowerCase().includes('paper') || service.name.toLowerCase().includes('policy') || service.name.toLowerCase().includes('brief');
    if (selectedCategory === 'teknik') return cat.includes('teknik') || service.name.toLowerCase().includes('teknik') || service.name.toLowerCase().includes('coding') || service.name.toLowerCase().includes('cad');
    return true;
  });

  const activeTestimonials = (testimonials && testimonials.length > 0)
    ? testimonials
    : (initialTestimonials && initialTestimonials.length > 0)
    ? initialTestimonials
    : [];

  const faqs = [
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
  ];

  const activeFaqs = (config.faqs && config.faqs.length > 0)
    ? config.faqs
    : faqs;

  const defaultSkripsiFeatures = [
    'Bisa ngerjain Bab 1 sampai 5 lengkap, disesuaikan panduan kampusmu',
    'Bantu olah data (SPSS, Excel, SEM, dll.) plus penjelasannya',
    'Sudah termasuk cek Turnitin aman dan gratis revisi sampai ACC',
  ];

  const activeSkripsiFeatures = (config.skripsiFeatures && config.skripsiFeatures.length > 0)
    ? config.skripsiFeatures
    : defaultSkripsiFeatures;

  const steps = [
    {
      num: '01',
      title: 'Chat Admin & Kirim Bahan',
      desc: 'Hubungi WhatsApp admin kami, kirimkan detail tugas, panduan/ketentuan, dan info deadline Anda.',
    },
    {
      num: '02',
      title: 'Cek Biaya & Kesepakatan',
      desc: 'Admin berikan perkiraan biaya yang jelas dan jadwal pengerjaan sesuai kesepakatan bersama.',
    },
    {
      num: '03',
      title: 'Proses Pengerjaan Tugas',
      desc: 'Tugas dikerjakan dengan teliti oleh tim sesuai bidang dan jenjang pendidikan Anda dengan rujukan yang tepat.',
    },
    {
      num: '04',
      title: 'Hasil Selesai & Garansi Revisi',
      desc: 'File diserahkan rapi beserta hasil cek Turnitin (jika dibutuhkan). Ada catatan revisi? Langsung kami bantu bereskan.',
    },
  ];

  return (
    <>
      {/* ===================== NAVBAR ===================== */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="/" className="navbar-logo">
            {config.logoImageUrl ? (
              <img
                src={config.logoImageUrl}
                alt="Bryz Academic Support"
                className="navbar-logo-img"
                style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain' }}
              />
            ) : (
              <div className="navbar-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
            )}
            <div className="navbar-logo-text">
              <span>Bryz Academic Support</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
              <li><a href="#pricelist" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Daftar Harga</a></li>
              <li><a href="#keunggulan" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Keunggulan</a></li>
              <li><a href="#alur" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Alur Kerja</a></li>
              <li><a href="#testimoni" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Testimoni</a></li>
              <li><a href="#faq" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a></li>
            </ul>
          </nav>

          {/* Actions: Theme Toggle + WhatsApp Buttons */}
          <div className="navbar-actions">
            <ThemeToggle />
            <div className="navbar-divider" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a
                href={waLink1}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                title={`Chat WhatsApp Admin 1 (+${waNumber1})`}
                onClick={(e) => handleWaClick(e)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                </svg>
                <span>Admin 1</span>
              </a>
              <a
                href={waLink2}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                title={`Chat WhatsApp Admin 2 (+${waNumber2})`}
                style={{ background: '#059669' }}
                onClick={(e) => handleWaClick(e)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                </svg>
                <span>Admin 2</span>
              </a>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka navigasi menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO SECTION (Clean & Modern - DESIGN.md §7) ===================== */}
      <section className="hero-editorial section-ivory" id="hero">
        <div className="container hero-container-clean">
          <div className="hero-header-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              <span>{config.heroEyebrow || 'Bimbingan & Bantu Tugas Akademik Terpercaya'}</span>
            </div>
            
            <h1 className="hero-title">
              {config.heroTitle || 'Bantu Tugas Sekolah, Kuliah & Riset Akademik Sampai Tuntas'}
            </h1>
            
            <p className="hero-description">
              {config.heroDescription || 'Pusing mikirin tugas sekolah, tugas kuliah, makalah, skripsi, atau olah data yang mepet deadline? Tim Bryz Academic siap bantu dari awal sampai tuntas. Dikerjakan oleh fresh graduate PTN top 3, rapi, bebas plagiasi (Turnitin aman), dan bergaransi revisi.'}
            </p>

            <div className="hero-buttons">
              <a
                href={waLink1}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                title={`Chat WhatsApp Admin 1 (+${waNumber1})`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                </svg>
                <span>Chat Admin 1</span>
              </a>
              <a
                href={waLink2}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                title={`Chat WhatsApp Admin 2 (+${waNumber2})`}
                style={{ background: '#059669' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                </svg>
                <span>Chat Admin 2</span>
              </a>
              <a href="#pricelist" className="btn btn-editorial-outline btn-lg">
                <span>Cek Daftar Harga</span>
              </a>
            </div>

            {/* Reassurance Meta Bar */}
            <div className="hero-reassurance">
              <span className="reassurance-item">
                <span className="reassurance" />
                <span>Konsultasi Gratis</span>
              </span>
              <span className="reassurance-item">
                <span>Identitas &amp; Data 100% Aman</span>
              </span>
              <span className="reassurance-item">
                <span>Admin Fast Response</span>
              </span>
            </div>
          </div>

          {/* 4 Clean Value Highlight Cards */}
          <div className="hero-highlights-grid">
            <div className="hero-highlight-card">
              <div className="highlight-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div className="highlight-body">
                <h3 className="highlight-title">Bebas Plagiasi (Turnitin Aman)</h3>
                <p className="highlight-desc">Pengecekan resmi Turnitin no-repository, berkas Anda aman dan tidak tersimpan di database.</p>
              </div>
            </div>

            <div className="hero-highlight-card">
              <div className="highlight-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="highlight-body">
                <h3 className="highlight-title">Fresh Graduate PTN Top 3</h3>
                <p className="highlight-desc">Dikerjakan langsung oleh lulusan fresh graduate PTN top 3 dengan rujukan ilmiah kredibel dan terstandar.</p>
              </div>
            </div>

            <div className="hero-highlight-card">
              <div className="highlight-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6 6" />
                </svg>
              </div>
              <div className="highlight-body">
                <h3 className="highlight-title">Garansi Revisi</h3>
                <p className="highlight-desc">Ada catatan revisi? Langsung dibantu perbaiki sampai tuntas tanpa biaya tambahan.</p>
              </div>
            </div>

            <div className="hero-highlight-card">
              <div className="highlight-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="highlight-body">
                <h3 className="highlight-title">Bisa Kilat &amp; Tepat Waktu</h3>
                <p className="highlight-desc">Deadline mepet? Tersedia opsi pengerjaan kilat 24–48 jam dengan hasil tetap rapi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== DAFTAR HARGA TERBUKA ===================== */}
      <section className="section section-paper" id="pricelist">
        <div id="layanan" style={{ position: 'relative', top: '-80px' }} />
        <div className="container">
          <h2 className="section-title">Daftar Harga Terbuka</h2>
          <p className="section-subtitle">
            Perkiraan biaya ramah kantong dan transparan. Biaya fleksibel dan bisa disesuaikan dengan tingkat kesulitan serta deadline tugas Anda.
          </p>

          {/* Segmented Filter Controls */}
          <div className="tabs-container-wrapper">
            <div className="tabs-segmented">
              <button
                type="button"
                className={`tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Semua Layanan
              </button>
              <button
                type="button"
                className={`tab-btn ${selectedCategory === 'skripsi' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('skripsi')}
              >
                Skripsi &amp; Proposal
              </button>
              <button
                type="button"
                className={`tab-btn ${selectedCategory === 'ilmiah' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ilmiah')}
              >
                Artikel &amp; Paper
              </button>
              <button
                type="button"
                className={`tab-btn ${selectedCategory === 'teknik' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('teknik')}
              >
                Teknik &amp; Coding
              </button>
            </div>
          </div>

          {/* Desktop Clean Table View */}
          <div className="table-card pricelist-desktop-view">
            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th style={{ width: '26%' }}>Jenis Layanan</th>
                    <th style={{ width: '28%' }}>Fasilitas &amp; Standar Kualitas</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Waktu Pengerjaan</th>
                    <th style={{ width: '26%', textAlign: 'right' }}>Perkiraan Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.sort((a, b) => a.order - b.order).map((service) => {
                    const category = service.category || getCategoryFromService(service.name);
                    const timeEst = service.estimatedTime || getEstimatedTime(service.name);
                    const features = (service.features && service.features.length > 0) ? service.features : getFeatures(service.name);

                    return (
                      <tr key={service.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div className="pricelist-icon-box">{service.icon}</div>
                            <div>
                              <div className="table-service-name">{service.name}</div>
                              <span className="table-service-badge">{category}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="feature-list">
                            {features.map((feat, idx) => (
                              <div key={idx} className="feature-item">
                                <span className="feature-check">✓</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="time-badge">
                            ⏱️ {timeEst}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-price">{service.price}</div>
                          <span className="table-price-sub">Bisa nego</span>
                          <div style={{ marginTop: '8px', display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <a
                              href={buildWaUrl(waNumber1, `Halo Admin 1 Bryz Academic Support, saya ingin konsultasi pengerjaan *${service.name}*. Boleh info estimasi pengerjaan, syarat, dan harganya?`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-sm"
                              style={{ display: 'inline-flex', padding: '6px 10px', fontSize: '0.8rem' }}
                              title={`Tanya Admin 1 (+${waNumber1})`}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                              </svg>
                              <span>Admin 1</span>
                            </a>
                            <a
                              href={buildWaUrl(waNumber2, `Halo Admin 2 Bryz Academic Support, saya ingin konsultasi pengerjaan *${service.name}*. Boleh info estimasi pengerjaan, syarat, dan harganya?`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-sm"
                              style={{ display: 'inline-flex', padding: '6px 10px', fontSize: '0.8rem', background: '#059669' }}
                              title={`Tanya Admin 2 (+${waNumber2})`}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                              </svg>
                              <span>Admin 2</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Clean Cards View */}
          <div className="pricelist-mobile-view">
            {filteredServices.sort((a, b) => a.order - b.order).map((service) => {
              const category = service.category || getCategoryFromService(service.name);
              const timeEst = service.estimatedTime || getEstimatedTime(service.name);
              const features = (service.features && service.features.length > 0) ? service.features : getFeatures(service.name);

              return (
                <div key={service.id} className="pricelist-mobile-card">
                  {/* Top: Icon + Title + Category Badge ONLY (No price crowding) */}
                  <div className="pm-card-top">
                    <div className="pm-card-icon">{service.icon}</div>
                    <div className="pm-card-title-box">
                      <div className="pm-card-title">{service.name}</div>
                      <span className="table-service-badge">{category}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="feature-list" style={{ margin: '14px 0 12px' }}>
                    {features.map((feat, idx) => (
                      <div key={idx} className="feature-item">
                        <span className="feature-check">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dedicated Price & Time Section - Completely separated */}
                  <div className="pm-card-price-row">
                    <div className="pm-card-price-info">
                      <span className="pm-price-label">Perkiraan Biaya</span>
                      <div className="pm-card-price-val">{service.price}</div>
                      <span className="table-price-sub">Biaya fleksibel &amp; bisa nego/cicil</span>
                    </div>
                    <div className="time-badge">
                      ⏱️ {timeEst}
                    </div>
                  </div>

                  {/* Action CTA Buttons */}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <a
                      href={buildWaUrl(waNumber1, `Halo Admin 1 Bryz Academic Support, saya ingin konsultasi pengerjaan *${service.name}*. Boleh info estimasi pengerjaan, syarat, dan harganya?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp pm-card-btn"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                      </svg>
                      <span>Tanya Admin 1</span>
                    </a>
                    <a
                      href={buildWaUrl(waNumber2, `Halo Admin 2 Bryz Academic Support, saya ingin konsultasi pengerjaan *${service.name}*. Boleh info estimasi pengerjaan, syarat, dan harganya?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp pm-card-btn"
                      style={{ flex: 1, justifyContent: 'center', background: '#059669' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                      </svg>
                      <span>Tanya Admin 2</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== KENAPA PERCAYAKAN TUGAS KE KAMI ===================== */}
      <section className="section section-soft-blue" id="keunggulan">
        <div className="container">
          <h2 className="section-title">Kenapa Percayakan Tugas ke Kami?</h2>
          <p className="section-subtitle">
            Kami pastikan setiap tugas dikerjakan serius dan teliti agar dapat hasil dan nilai optimal.
          </p>

          <div className="standards-grid">
            <div className="standard-card">
              <div className="standard-icon-badge" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="standard-content">
                <h3>Referensi Valid &amp; Terkini</h3>
                <p>
                  Menggunakan referensi buku dan jurnal ilmiah yang relevan, valid, dan dapat dipertanggungjawabkan.
                </p>
              </div>
            </div>

            <div className="standard-card">
              <div className="standard-icon-badge" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="standard-content">
                <h3>Format Sesuai Pedoman Tugas</h3>
                <p>
                  Format sitasi baku (APA, IEEE, Harvard, dll.) serta disesuaikan penuh dengan buku pedoman atau ketentuan tugas Anda.
                </p>
              </div>
            </div>

            <div className="standard-card">
              <div className="standard-icon-badge" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="standard-content">
                <h3>Cek Turnitin Resmi &amp; Aman</h3>
                <p>
                  Pengecekan Turnitin no-repo resmi, menjaga naskah tetap aman tanpa tersimpan ke database publik.
                </p>
              </div>
            </div>

            <div className="standard-card">
              <div className="standard-icon-badge" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="standard-content">
                <h3>Bisa Konsultasi &amp; Tanya Jawab</h3>
                <p>
                  Bukan cuma serah terima file: tim kami siap jelaskan isi tulisan dan mendampingi sampai tuntas disetujui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WORKFLOW STEPS PIPELINE (Ivory Section - DESIGN.md §6) ===================== */}
      <section className="section section-ivory" id="alur">
        <div className="container">
          <h2 className="section-title">Alur Pemesanan 4 Langkah</h2>
          <p className="section-subtitle">
            Proses pesan simpel, santai, dan jelas tanpa ribet.
          </p>

          <div className="steps-pipeline">
            {steps.map((st) => (
              <div key={st.num} className="pipeline-step">
                <div className="pipeline-step-header">
                  <span className="pipeline-num-badge">LANGKAH {st.num}</span>
                </div>
                <h3 className="pipeline-step-title">{st.title}</h3>
                <p className="pipeline-step-desc">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* QRIS Payment Method Card */}
          <div className="qris-card">
            <div className="qris-card-inner">
              <div className="qris-card-info">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--tag-bg)', borderRadius: '6px', marginBottom: '12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tag-text)', letterSpacing: '0.03em' }}>
                    PEMBAYARAN RESMI &amp; PRAKTIS
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.015em' }}>
                  Bayar Mudah &amp; Aman Pakai QRIS (Semua Bank &amp; E-Wallet)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  Bisa bayar dari bank apa saja atau dompet digital favoritmu. Cukup scan barcode QRIS kami tanpa perlu repot mengetik nomor rekening secara manual.
                </p>

                {/* Bank / E-Wallet Badges */}
                <div className="qris-badge-grid">
                  <span className="qris-bank-pill">BCA Mobile</span>
                  <span className="qris-bank-pill">Livin&apos; Mandiri</span>
                  <span className="qris-bank-pill">BRImo</span>
                  <span className="qris-bank-pill">BNI Mobile</span>
                  <span className="qris-bank-pill">GoPay</span>
                  <span className="qris-bank-pill">OVO</span>
                  <span className="qris-bank-pill">DANA</span>
                  <span className="qris-bank-pill">ShopeePay</span>
                  <span className="qris-bank-pill">LinkAja</span>
                </div>
              </div>

              {/* Action Button to Open QRIS */}
              <div className="qris-card-action">
                <button
                  type="button"
                  onClick={() => setShowQrisModal(true)}
                  className="btn btn-primary qris-btn-action"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Buka / Scan QRIS Pembayaran</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      {activeTestimonials.length > 0 && (
        <section className="section section-paper" id="testimoni">
          <div className="container">
            <h2 className="section-title">Screenshot Bukti Chat &amp; Hasil ACC Klien</h2>
            <p className="section-subtitle">
              Tangkapan layar asli dari klien yang sudah kami bantu menyelesaikan tugas akademiknya. Pilih bulan untuk melihat buktinya.
            </p>

            <div className="testimonial-months">
            {groupTestimonialsByMonth(activeTestimonials).map((group) => {
              const isOpen = openTestimonialMonth === group.month;
              const panelId = `testimoni-panel-${group.month}`;
              return (
            <section key={group.month} className={`testimonial-month${isOpen ? ' is-open' : ''}`}>
              <h3 className="testimonial-month-heading">
                <button
                  type="button"
                  className="testimonial-month-toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenTestimonialMonth(isOpen ? null : group.month)}
                >
                  <img
                    src={group.items[0].imageUrl}
                    alt=""
                    className="testimonial-month-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="testimonial-month-text">
                    <span className="testimonial-month-label">{group.label}</span>
                    <span className="testimonial-month-count">{group.items.length} bukti chat &amp; ACC</span>
                  </span>
                  <span className="testimonial-month-action">
                    {isOpen ? 'Tutup' : 'Lihat bukti'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>
              </h3>
            <div className="testimonials-grid testimonial-month-panel" id={panelId} hidden={!isOpen}>
              {group.items.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className="testimonial-card"
                  onClick={() => setPreviewImage(t.imageUrl)}
                  aria-label={`Perbesar bukti screenshot testimoni ${t.name}`}
                >
                  <img
                    src={t.imageUrl}
                    alt={`Screenshot Testimoni ${t.name}`}
                    className="testimonial-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="testimonial-info">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--c-gold)',
                        background: 'rgba(198, 164, 106, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(198, 164, 106, 0.3)',
                      }}>
                        Pengerjaan Tugas
                      </span>
                      <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                    </div>
                    <div className="testimonial-name" style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.35 }}>
                      {t.name}
                    </div>
                    <span className="testimonial-zoom-hint">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                      <span>Klik untuk zoom screenshot chat / ACC</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
            </section>
              );
            })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== FAQ SECTION (Ivory Section - DESIGN.md §6) ===================== */}
      <section className="section section-ivory" id="faq">
        <div className="container" style={{ maxWidth: '780px' }}>
          <h2 className="section-title">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="section-subtitle">
            Jawaban seputar privasi, revisi, Turnitin, dan cara pemesanan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeFaqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  className="faq-header-btn"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  aria-expanded={activeFaq === idx}
                  aria-controls={`faq-ans-${idx}`}
                  id={`faq-hdr-${idx}`}
                >
                  <span className="faq-question">{faq.q}</span>
                  <svg
                    className={`faq-icon ${activeFaq === idx ? 'open' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {activeFaq === idx && (
                  <div id={`faq-ans-${idx}`} role="region" aria-labelledby={`faq-hdr-${idx}`}>
                    <p className="faq-answer">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA BOX ===================== */}
      <section className="section section-paper" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="cta-card-box">
            <h2>
              Deadline Mepet? Tenang, Jangan Panik!
            </h2>
            <p>
              Konsultasikan tugas sekolah, tugas kuliah, makalah, karya ilmiah, atau skripsi Anda sekarang dengan admin. Kami siap respons cepat dan bantu cari solusi terbaik.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <a
                href={waLink1}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                title={`Tanya WhatsApp Admin 1 (+${waNumber1})`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                </svg>
                <span>Tanya Admin 1</span>
              </a>
              <a
                href={waLink2}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                title={`Tanya WhatsApp Admin 2 (+${waNumber2})`}
                style={{ background: '#059669' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                </svg>
                <span>Tanya Admin 2</span>
              </a>
              <button
                type="button"
                onClick={() => setShowQrisModal(true)}
                className="btn btn-editorial-outline btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Lihat Kode QRIS</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CLEAN FOOTER ===================== */}
      <footer className="footer-clean">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Identity */}
            <div className="footer-col-brand">
              <a href="/" className="navbar-logo" style={{ marginBottom: '14px', textDecoration: 'none' }}>
                {config.logoImageUrl ? (
                  <img
                    src={config.logoImageUrl}
                    alt="Bryz Academic Support"
                    className="navbar-logo-img"
                    style={{ maxHeight: '34px', width: 'auto', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="navbar-logo-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                )}
                <div className="navbar-logo-text">
                  <span>Bryz Academic Support</span>
                </div>
              </a>
              <p className="footer-brand-desc">
                Layanan asistensi dan bimbingan tugas akademik terpercaya. Privasi aman, pengecekan Turnitin resmi, dan bergaransi revisi sampai tuntas.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '6px 12px', background: 'var(--tag-bg)', borderRadius: '20px', fontSize: '0.78rem', color: 'var(--tag-text)', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', flexShrink: 0 }} />
                <span>Konsultasi Buka • Siap Respons Cepat</span>
              </div>
            </div>

            {/* Column 2: Pilihan Layanan */}
            <div>
              <div className="footer-heading">Pilihan Layanan</div>
              <ul className="footer-links">
                <li><a href="#pricelist" className="footer-link">Skripsi &amp; Tugas Akhir</a></li>
                <li><a href="#pricelist" className="footer-link">Proposal Skripsi</a></li>
                <li><a href="#pricelist" className="footer-link">Artikel Ilmiah &amp; Jurnal</a></li>
                <li><a href="#pricelist" className="footer-link">Makalah Akademik</a></li>
                <li><a href="#pricelist" className="footer-link">Esai, Opini &amp; Paper</a></li>
                <li><a href="#pricelist" className="footer-link">Tugas Teknik &amp; Olah Data</a></li>
              </ul>
            </div>

            {/* Column 3: Navigasi Halaman */}
            <div>
              <div className="footer-heading">Navigasi</div>
              <ul className="footer-links">
                <li><a href="#pricelist" className="footer-link">Daftar Harga Terbuka</a></li>
                <li><a href="#keunggulan" className="footer-link">Standar Mutu &amp; Keunggulan</a></li>
                <li><a href="#alur" className="footer-link">Alur Pengerjaan Tugas</a></li>
                <li><a href="#testimoni" className="footer-link">Bukti &amp; Testimoni ACC</a></li>
                <li><a href="#faq" className="footer-link">Tanya Jawab (FAQ)</a></li>
              </ul>
            </div>

            {/* Column 4: Bantuan & Kontak */}
            <div>
              <div className="footer-heading">Hubungi Kami</div>
              <ul className="footer-links">
                <li>
                  <a
                    href={buildWaUrl(config.whatsappNumber, 'Halo Admin 1 Bryz Academic Support, saya ingin konsultasi tugas akademik.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                    style={{ color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={(e) => handleWaClick(e)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                    </svg>
                    <span>{hasSecondWa ? `WA Admin 1: +${config.whatsappNumber}` : `WhatsApp: +${config.whatsappNumber}`}</span>
                  </a>
                </li>
                {hasSecondWa && (
                  <li>
                    <a
                      href={buildWaUrl(config.whatsappNumber2!, 'Halo Admin 2 Bryz Academic Support, saya ingin konsultasi tugas akademik.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                      style={{ color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={(e) => handleWaClick(e)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                      </svg>
                      <span>WA Admin 2: +{config.whatsappNumber2}</span>
                    </a>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => setShowQrisModal(true)}
                    className="footer-link"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>Barcode QRIS Pembayaran</span>
                  </button>
                </li>
                <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Jam Operasional: 24 Jam Fleksibel
                </li>
                <li>
                  <a href="/admin" className="footer-link" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    Portal Admin
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Sub-Footer Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} <strong>Bryz Academic Support</strong>. Seluruh hak cipta dilindungi undang-undang.
            </p>
            <div className="footer-bottom-links">
              <a
                href="#pricelist"
                className="footer-bottom-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Kembali ke Atas ↑
              </a>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <a href="/admin" className="footer-bottom-link">
                Admin Console
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== QRIS PAYMENT MODAL ===================== */}
      {showQrisModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowQrisModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qris-modal-title"
        >
          <div className="qris-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span id="qris-modal-title" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Pembayaran QRIS Resmi
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Terverifikasi
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                aria-label="Tutup popup pembayaran QRIS"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* QRIS White Board Container */}
            <div className="qris-code-container">
              {/* Header Bar QRIS Logo */}
              <div className="qris-header-logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.04em', color: '#dc2626', fontFamily: 'sans-serif' }}>
                    QRIS
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, lineHeight: 1.1 }}>
                    STANDAR PEMBAYARAN<br />NASIONAL
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#1e3a8a', letterSpacing: '0.04em' }}>
                  GPN INDONESIA
                </div>
              </div>

              {/* Merchant Title */}
              <div className="qris-merchant-title">BRYZ ACADEMIC SUPPORT, COBLONG</div>
              <div className="qris-merchant-sub">NMID: ID1024329012398</div>

              {/* QR Image or Fallback SVG */}
              <div style={{ margin: '18px 0', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                {config.qrisImageUrl ? (
                  <button
                    type="button"
                    onClick={() => { setPreviewImage(config.qrisImageUrl!); setIsZoomed(false); }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'zoom-in', display: 'inline-block' }}
                    title="Klik untuk memperbesar barcode QRIS"
                    aria-label="Perbesar barcode QRIS"
                  >
                    <img
                      src={config.qrisImageUrl}
                      alt="Kode Barcode QRIS Resmi"
                      style={{
                        maxWidth: '260px',
                        maxHeight: '260px',
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </button>
                ) : (
                  <div style={{
                    width: '240px',
                    height: '240px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '2px dashed #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    textAlign: 'center',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <path d="M7 7h.01M17 7h.01M7 17h.01" />
                    </svg>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Barcode QRIS Siap Digunakan
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                      Unggah foto barcode toko Anda melalui menu <strong>Admin &gt; Pengaturan</strong>
                    </span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.74rem', color: '#64748b', textAlign: 'center', fontWeight: 500 }}>
                Dapat di-scan dengan seluruh aplikasi Mobile Banking &amp; Dompet Digital (GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, dll.)
              </div>
            </div>

            {/* Steps Guide */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px 16px', margin: '16px 0', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Panduan Transfer QRIS:
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Buka aplikasi m-Banking atau e-Wallet kesayangan Anda.</li>
                <li>Pilih fitur <strong>Scan / Bayar QRIS</strong> lalu arahkan ke barcode di atas.</li>
                <li>Masukkan nominal biaya sesuai hasil kesepakatan bersama admin.</li>
                <li>Simpan bukti transaksi lalu kirimkan ke WhatsApp kami.</li>
              </ol>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={buildWaUrl(waNumber1, 'Halo Admin 1 Bryz Academic Support, saya ingin mengonfirmasi pembayaran tugas via QRIS. Berikut saya lampirkan bukti transfernya:')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                  </svg>
                  <span>Kirim ke Admin 1</span>
                </a>
                <a
                  href={buildWaUrl(waNumber2, 'Halo Admin 2 Bryz Academic Support, saya ingin mengonfirmasi pembayaran tugas via QRIS. Berikut saya lampirkan bukti transfernya:')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm"
                  style={{ flex: 1, justifyContent: 'center', background: '#059669' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                  </svg>
                  <span>Kirim ke Admin 2</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== LIGHTBOX MODAL ===================== */}
      {previewImage && (
        <div
          className="modal-overlay"
          onClick={() => { setPreviewImage(null); setIsZoomed(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Bukti Screenshot"
          style={{ cursor: 'zoom-out', padding: '16px', zIndex: 2100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: isZoomed ? '96vw' : '88vw',
              maxHeight: '94vh',
              background: 'var(--bg-card)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              cursor: 'default',
            }}
          >
            {/* Top Toolbar */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Pratinjau Bukti / Screenshot</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {isZoomed ? '• Mode Zoom 100% (Scroll untuk baca chat)' : '• Klik gambar atau tombol zoom untuk perbesar'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', minHeight: '36px' }}
                  title={isZoomed ? 'Perkecil ke ukuran pas layar' : 'Perbesar tulisan chat screenshot'}
                >
                  {isZoomed ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      <span>Perkecil</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      <span>Perbesar (Baca Chat)</span>
                    </>
                  )}
                </button>
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', minHeight: '36px', textDecoration: 'none' }}
                  title="Buka gambar resolusi asli di tab baru"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Buka Tab Baru</span>
                </a>
                <button
                  type="button"
                  onClick={() => { setPreviewImage(null); setIsZoomed(false); }}
                  aria-label="Tutup pratinjau"
                  className="btn btn-secondary btn-sm"
                  style={{ minWidth: '36px', minHeight: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable / Zoomable image area */}
            <div
              style={{
                width: '100%',
                maxHeight: 'calc(94vh - 60px)',
                overflow: 'auto',
                display: 'flex',
                justifyContent: isZoomed ? 'flex-start' : 'center',
                alignItems: isZoomed ? 'flex-start' : 'center',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.04)',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
              }}
              onClick={() => setIsZoomed(!isZoomed)}
              title={isZoomed ? 'Klik untuk perkecil tampilan' : 'Klik untuk perbesar tulisan chat screenshot'}
            >
              <img
                src={previewImage}
                alt="Bukti Screenshot Testimoni"
                style={{
                  display: 'block',
                  margin: 'auto',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'max-width 0.2s ease, width 0.2s ease',
                  ...(isZoomed ? {
                    width: 'auto',
                    maxWidth: 'none',
                    minWidth: 'min(100%, 720px)',
                  } : {
                    maxWidth: '100%',
                    maxHeight: 'calc(94vh - 92px)',
                    objectFit: 'contain',
                  }),
                }}
              />
            </div>
          </div>
        </div>
      )}



      {/* ===================== MODAL PEMILIHAN ADMIN WHATSAPP ===================== */}
      {showWaSelector && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-selector-title"
          onClick={() => setShowWaSelector(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--success, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                  </svg>
                </div>
                <div>
                  <h3 id="wa-selector-title" style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700 }}>
                    Hubungi Admin WhatsApp
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Pilih salah satu kontak di bawah ini
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWaSelector(false)}
                aria-label="Tutup pilihan WhatsApp"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Kedua admin kami siap merespons konsultasi, pertanyaan pricelist, dan pemesanan tugas Anda.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Tombol Admin 1 */}
              <button
                type="button"
                onClick={() => openWa(config.whatsappNumber)}
                className="btn btn-whatsapp"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Chat Admin 1</span>
                </div>
                <span style={{ fontSize: '0.78rem', opacity: 0.9, fontFamily: 'monospace' }}>
                  +{config.whatsappNumber}
                </span>
              </button>

              {/* Tombol Admin 2 */}
              {config.whatsappNumber2 && (
                <button
                  type="button"
                  onClick={() => openWa(config.whatsappNumber2!)}
                  className="btn btn-whatsapp"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Chat Admin 2</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', opacity: 0.9, fontFamily: 'monospace' }}>
                    +{config.whatsappNumber2}
                  </span>
                </button>
              )}
            </div>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowWaSelector(false)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
