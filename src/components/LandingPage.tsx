'use client';

import { useState, useEffect } from 'react';
import { Service, Testimonial, SiteConfig } from '@/lib/types';
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
  const [config, setConfig] = useState<SiteConfig>(initialConfig);

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showQrisModal, setShowQrisModal] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        setConfig(JSON.parse(localConf));
        hasLocalConfig = true;
      }
      const localTest = localStorage.getItem('bryz_testimonials');
      if (localTest) {
        setTestimonials(JSON.parse(localTest));
        hasLocalTestimonials = true;
      }
      const localServ = localStorage.getItem('bryz_services');
      if (localServ) {
        setServices(JSON.parse(localServ));
        hasLocalServices = true;
      }
    } catch {}

    // 2. Fetch live data dari API backend & status blob
    Promise.all([
      fetch('/api/services', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/testimonials', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/config', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      fetch('/api/status', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
    ])
      .then(([s, t, c, st]) => {
        const isBlobActive = Boolean(st?.blobConnected);

        if (Array.isArray(s) && (isBlobActive || !hasLocalServices)) {
          setServices(s);
        }
        if (Array.isArray(t) && (isBlobActive || !hasLocalTestimonials)) {
          setTestimonials(t);
        }
        if (c && typeof c === 'object') {
          if (isBlobActive) {
            setConfig(c);
          } else {
            setConfig((prev) => ({
              ...c,
              ...prev,
              logoImageUrl: prev.logoImageUrl || c.logoImageUrl,
              qrisImageUrl: prev.qrisImageUrl || c.qrisImageUrl,
              whatsappNumber: (hasLocalConfig && prev.whatsappNumber) ? prev.whatsappNumber : c.whatsappNumber,
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const getWaLink = (serviceName?: string) => {
    const text = serviceName
      ? `Halo Admin Bryz Academic Support, saya ingin konsultasi pengerjaan *${serviceName}*. Boleh info estimasi pengerjaan, syarat, dan harganya?`
      : 'Halo Admin Bryz Academic Support, saya ingin konsultasi pengerjaan tugas akademik saya. Mohon infonya ya!';
    return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const defaultWaLink = getWaLink();

  const getCategoryFromService = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('skripsi') || lower.includes('proposal')) return 'Skripsi & Proposal';
    if (lower.includes('artikel') || lower.includes('jurnal')) return 'Publikasi Ilmiah';
    if (lower.includes('makalah') || lower.includes('esai') || lower.includes('paper')) return 'Karya Tulis';
    if (lower.includes('teknik') || lower.includes('coding')) return 'Tugas Teknik';
    return 'Akademik';
  };

  const getEstimatedTime = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('skripsi')) return '5 - 14 Hari (Fleksibel)';
    if (lower.includes('proposal')) return '3 - 7 Hari';
    if (lower.includes('artikel') || lower.includes('jurnal')) return '3 - 5 Hari';
    if (lower.includes('teknik')) return '2 - 5 Hari / Kilat';
    return '1 - 3 Hari (Bisa Kilat)';
  };

  const getFeatures = (name: string): string[] => {
    const lower = name.toLowerCase();
    if (lower.includes('skripsi') || lower.includes('proposal')) {
      return ['Garansi revisi sampai ACC', 'Lolos cek Turnitin < 15%', 'Bimbingan & Olah Data'];
    }
    if (lower.includes('artikel') || lower.includes('jurnal')) {
      return ['Format IMRAD Jurnal SINTA', 'Sitasi Mendeley / Zotero', 'Bebas Plagiasi'];
    }
    if (lower.includes('teknik')) {
      return ['Kode/Perhitungan Terverifikasi', 'Source code & Dokumentasi', 'Testing & Konsultasi'];
    }
    return ['Bebas Plagiarisme', 'Referensi Jurnal Terkini', 'Garansi Revisi Gratis'];
  };

  const filteredServices = services.filter((service) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'skripsi') return service.name.toLowerCase().includes('skripsi') || service.name.toLowerCase().includes('proposal');
    if (selectedCategory === 'ilmiah') return service.name.toLowerCase().includes('artikel') || service.name.toLowerCase().includes('jurnal') || service.name.toLowerCase().includes('makalah') || service.name.toLowerCase().includes('esai') || service.name.toLowerCase().includes('paper');
    if (selectedCategory === 'teknik') return service.name.toLowerCase().includes('teknik') || service.name.toLowerCase().includes('coding') || service.name.toLowerCase().includes('cad');
    return true;
  });

  const faqs = [
    {
      q: 'Apakah kerahasiaan identitas dan data saya dijamin aman?',
      a: '100% Terjamin Rahasia. Kami tidak pernah membagikan identitas nama, kampus, maupun dokumen pengerjaan ke pihak ketiga demi menjaga privasi dan reputasi akademik Anda.',
    },
    {
      q: 'Bagaimana jika dosen saya memberikan catatan revisi?',
      a: 'Kami memberikan garansi revisi gratis tanpa biaya tambahan sampai tugas Anda disetujui dosen, sesuai dengan kesepakatan topik dan panduan di awal.',
    },
    {
      q: 'Apakah tugas dicek dengan Turnitin resmi?',
      a: 'Ya, seluruh dokumen karya tulis kami kerjakan dengan teknik parafrase human-written berkualitas tinggi dan kami sertakan bukti lolos uji Turnitin standar kampus.',
    },
    {
      q: 'Berapa lama estimasi pengerjaannya?',
      a: 'Waktu pengerjaan disesuaikan dengan kebutuhan Anda. Kami melayani kebutuhan kilat (24 - 48 jam) untuk tugas mendesak, hingga pengerjaan terjadwal bertahap untuk bab skripsi.',
    },
    {
      q: 'Bagaimana sistem pembayarannya?',
      a: 'Transparan dan aman: Cukup DP 30% - 50% untuk mulai pengerjaan. Pelunasan dilakukan setelah tugas selesai dan bukti progres kami perlihatkan.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Konsultasi & Kirim Detail',
      desc: 'Hubungi WhatsApp admin kami, kirimkan judul tugas, buku panduan kampus, dan deadline Anda.',
    },
    {
      num: '02',
      title: 'Estimasi & Kesepakatan',
      desc: 'Admin memberikan estimasi biaya transparan dan jadwal pengerjaan yang disepakati bersama.',
    },
    {
      num: '03',
      title: 'Pengerjaan oleh Tim Ahli',
      desc: 'Tugas diproses secara profesional oleh tim spesialis sesuai rumpun bidang studi Anda.',
    },
    {
      num: '04',
      title: 'Serah Terima & Garansi ACC',
      desc: 'File diserahkan rapi beserta laporan Turnitin. Tim siap mendampingi revisi sampai tuntas.',
    },
  ];

  return (
    <>
      {/* ===================== NAVBAR ===================== */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="#" className="navbar-logo">
            {config.logoImageUrl ? (
              <img
                src={config.logoImageUrl}
                alt="Bryz Academic"
                className="navbar-logo-img"
              />
            ) : (
              <>
                <div className="navbar-logo-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className="navbar-logo-text">
                  <span>Bryz</span>
                  <span className="navbar-logo-badge">Academic</span>
                </div>
              </>
            )}
          </a>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
              <li><a href="#layanan" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Layanan</a></li>
              <li><a href="#pricelist" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Pricelist</a></li>
              <li><a href="#keunggulan" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Keunggulan</a></li>
              <li><a href="#testimoni" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Testimoni</a></li>
              <li><a href="#faq" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a></li>
            </ul>
          </nav>

          {/* Actions: Theme Toggle + WhatsApp Button */}
          <div className="navbar-actions">
            <ThemeToggle />
            <div className="navbar-divider" />
            <a
              href={defaultWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
              </svg>
              <span>Chat Admin</span>
            </a>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="hero" id="hero">
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>Bimbingan & Pengerjaan Akademik Terpercaya</span>
            </div>
            <h1 className="hero-title">
              Raih Kelulusan & Nilai Terbaik Bersama <span className="hero-title-highlight">Bryz Academic</span>
            </h1>
            <p className="hero-description">
              Solusi bantuan akademik terpadu untuk skripsi, proposal, artikel ilmiah, makalah, esai, paper, hingga tugas teknik. Cepat, orisinil, bebas plagiarisme, dan bergaransi sampai ACC.
            </p>
            <div className="hero-buttons">
              <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                </svg>
                <span>Konsultasi Gratis via WhatsApp</span>
              </a>
              <a href="#pricelist" className="btn btn-secondary btn-lg">
                <span>Cek Daftar Harga</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            {/* Metric Stats */}
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">{config.totalClients}</div>
                <div className="hero-stat-label">Mahasiswa Terbantu</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{config.totalProjects}</div>
                <div className="hero-stat-label">Tugas Terselesaikan</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{config.satisfaction}</div>
                <div className="hero-stat-label">Tingkat Kepuasan ACC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES SECTION ===================== */}
      <section className="section" id="layanan">
        <div className="container">
          <h2 className="section-title">Layanan Bantuan Akademik</h2>
          <p className="section-subtitle">
            Dikerjakan oleh tim profesional lulusan universitas terkemuka sesuai bidang keilmuan Anda.
          </p>

          <div className="services-grid">
            {services.sort((a, b) => a.order - b.order).map((service) => (
              <div key={service.id} className="service-card">
                <div>
                  <div className="service-icon-box">{service.icon}</div>
                  <h3 className="service-title">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
                <div className="service-footer">
                  <div className="service-price-pill">{service.price}</div>
                  <a
                    href={getWaLink(service.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Pesan</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PRICELIST SECTION (CLEAN TABLE) ===================== */}
      <section className="section" id="pricelist" style={{ background: 'var(--section-alt-bg)' }}>
        <div className="container">
          <h2 className="section-title">Open Pricelist Transparan</h2>
          <p className="section-subtitle">
            Daftar perkiraan harga dan fasilitas pengerjaan. Biaya dapat disesuaikan dengan tingkat kesulitan dan deadline Anda.
          </p>

          {/* Segmented Filter Controls */}
          <div style={{ textAlign: 'center' }}>
            <div className="tabs-segmented">
              <button
                className={`tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Semua Layanan
              </button>
              <button
                className={`tab-btn ${selectedCategory === 'skripsi' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('skripsi')}
              >
                Skripsi & Proposal
              </button>
              <button
                className={`tab-btn ${selectedCategory === 'ilmiah' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ilmiah')}
              >
                Artikel, Makalah & Paper
              </button>
              <button
                className={`tab-btn ${selectedCategory === 'teknik' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('teknik')}
              >
                Tugas Teknik & Coding
              </button>
            </div>
          </div>

          {/* Structured Modern Table */}
          <div className="table-card">
            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th style={{ width: '32%' }}>Jenis Layanan</th>
                    <th style={{ width: '30%' }}>Fasilitas & Standar Kualitas</th>
                    <th style={{ width: '18%' }}>Estimasi Waktu</th>
                    <th style={{ width: '12%' }}>Estimasi Harga</th>
                    <th style={{ width: '8%', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.sort((a, b) => a.order - b.order).map((service) => {
                    const category = getCategoryFromService(service.name);
                    const timeEst = getEstimatedTime(service.name);
                    const features = getFeatures(service.name);

                    return (
                      <tr key={service.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{ fontSize: '1.4rem', lineHeight: 1, marginTop: '2px' }}>{service.icon}</span>
                            <div>
                              <div className="table-service-name">{service.name}</div>
                              <span className="table-service-badge">{category}</span>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px' }}>
                                {service.description.substring(0, 95)}...
                              </p>
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
                        <td>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            ⏱️ {timeEst}
                          </span>
                        </td>
                        <td>
                          <div className="table-price">{service.price}</div>
                          <span className="table-price-sub">Bisa negosiasi</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <a
                            href={getWaLink(service.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            title={`Order ${service.name}`}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                            </svg>
                            <span>Order</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOOSE US ===================== */}
      <section className="section" id="keunggulan">
        <div className="container">
          <h2 className="section-title">Keunggulan Layanan Kami</h2>
          <p className="section-subtitle">
            Standar profesional yang menjamin kualitas tulisan dan kenyamanan Anda.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div className="service-card">
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>🛡️</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>100% Kerahasiaan Terjaga</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Privasi Anda adalah prioritas mutlak. Identitas mahasiswa, materi tugas, dan kampus tidak akan pernah dibocorkan.
              </p>
            </div>
            <div className="service-card">
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>⚡</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Tepat Waktu & Bisa Kilat</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Jaminan pengerjaan tepat sebelum deadline. Tersedia jalur kilat 24 jam untuk tugas-tugas mendesak.
              </p>
            </div>
            <div className="service-card">
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>📊</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Lolos Uji Turnitin Resmi</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Karya orisinil dengan teknik parafrase rapi. Disertai laporan Turnitin bebas plagiarisme sesuai standar kampus.
              </p>
            </div>
            <div className="service-card">
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>🔄</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Garansi Revisi Sampai ACC</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Bebas biaya revisi jika terdapat catatan dari dosen pembimbing hingga tugas disetujui sepenuhnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WORKFLOW STEPS ===================== */}
      <section className="section" style={{ background: 'var(--section-alt-bg)' }}>
        <div className="container">
          <h2 className="section-title">Alur Pemesanan 4 Langkah</h2>
          <p className="section-subtitle">
            Proses pemesanan mudah, cepat, dan transparan tanpa prosedur rumit.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {steps.map((st) => (
              <div key={st.num} className="service-card" style={{ position: 'relative' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', opacity: 0.35, position: 'absolute', top: '16px', right: '18px' }}>
                  {st.num}
                </span>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', paddingRight: '36px' }}>{st.title}</h3>
                <p style={{ fontSize: '0.88rem' }}>{st.desc}</p>
              </div>
            ))}
          </div>

          {/* QRIS Payment Method Card */}
          <div className="qris-card" style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--tag-bg)', borderRadius: '6px', marginBottom: '12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tag-text)', letterSpacing: '0.03em' }}>
                    METODE PEMBAYARAN RESMI & FLEKSIBEL
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.015em' }}>
                  Pembayaran Aman & Praktis via QRIS (All Payment)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  Mendukung seluruh bank & dompet digital di Indonesia. Cukup scan barcode QRIS kami tanpa perlu repot mengetik nomor rekening secara manual.
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
              <div>
                <button
                  type="button"
                  onClick={() => setShowQrisModal(true)}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-md)' }}
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

      {/* ===================== TESTIMONIALS (SS TESTIMONI) ===================== */}
      {testimonials.length > 0 && (
        <section className="section" id="testimoni">
          <div className="container">
            <h2 className="section-title">Screenshot Bukti Testimoni Klien</h2>
            <p className="section-subtitle">
              Tangkapan layar nyata kepuasan mahasiswa dari berbagai universitas. Klik kartu gambar untuk memperbesar tangkapan layar.
            </p>

            <div className="testimonials-grid">
              {testimonials.sort((a, b) => a.order - b.order).map((t) => (
                <div
                  key={t.id}
                  className="testimonial-card"
                  onClick={() => setPreviewImage(t.imageUrl)}
                  title="Klik untuk melihat resolusi penuh"
                >
                  <img
                    src={t.imageUrl}
                    alt={`Screenshot Testimoni ${t.name}`}
                    className="testimonial-image"
                  />
                  <div className="testimonial-info">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--tag-text)',
                        background: 'var(--tag-bg)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                      }}>
                        Pengerjaan Tugas
                      </span>
                      <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                    </div>
                    <div className="testimonial-name" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                      {t.name}
                    </div>
                    <span className="testimonial-zoom-hint">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                      <span>Klik untuk zoom screenshot chat / ACC</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== FAQ SECTION ===================== */}
      <section className="section" id="faq" style={{ background: 'var(--section-alt-bg)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <h2 className="section-title">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="section-subtitle">
            Jawaban seputar privasi, revisi, turnitin, dan prosedur pemesanan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="faq-item"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="faq-header">
                  <span className="faq-question">{faq.q}</span>
                  <svg
                    className={`faq-icon ${activeFaq === idx ? 'open' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {activeFaq === idx && (
                  <p className="faq-answer">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA BOX ===================== */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="table-card" style={{ padding: '54px 32px', maxWidth: '840px', margin: '0 auto', background: 'var(--bg-card)' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '14px', letterSpacing: '-0.025em' }}>
              Deadline Sudah Dekat? Jangan Ditunda Lagi!
            </h2>
            <p style={{ maxWidth: '580px', margin: '0 auto 28px', fontSize: '1rem' }}>
              Konsultasikan judul, tugas harian, maupun skripsi Anda sekarang dengan admin. Tim kami siap merespons dalam hitungan menit.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
                </svg>
                <span>Chat Admin WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setShowQrisModal(true)}
                className="btn btn-secondary btn-lg"
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
              <a href="/admin" className="btn btn-secondary btn-lg">
                <span>Portal Admin</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CLEAN FOOTER ===================== */}
      <footer className="footer-clean">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Mission */}
            <div>
              <a href="#" className="navbar-logo" style={{ marginBottom: '14px' }}>
                {config.logoImageUrl ? (
                  <img
                    src={config.logoImageUrl}
                    alt="Bryz Academic"
                    className="navbar-logo-img"
                    style={{ maxHeight: '36px' }}
                  />
                ) : (
                  <>
                    <div className="navbar-logo-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <div className="navbar-logo-text">
                      <span>Bryz</span>
                      <span className="navbar-logo-badge">Academic</span>
                    </div>
                  </>
                )}
              </a>
              <p className="footer-brand-desc">
                Solusi pendampingan dan asistensi tugas akademik tepercaya untuk mahasiswa di seluruh Indonesia. Mengutamakan privasi 100%, orisinalitas riset, dan garansi revisi sampai ACC.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', padding: '4px 10px', background: 'var(--tag-bg)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--tag-text)', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                <span>Konsultasi 24 Jam • Respons Cepat</span>
              </div>
            </div>

            {/* Column 2: Layanan */}
            <div>
              <div className="footer-heading">Layanan Akademik</div>
              <ul className="footer-links">
                <li><a href="#layanan" className="footer-link">Skripsi & Tesis Bab 1-5</a></li>
                <li><a href="#layanan" className="footer-link">Proposal Skripsi & Olah Data</a></li>
                <li><a href="#layanan" className="footer-link">Artikel Jurnal SINTA / Scopus</a></li>
                <li><a href="#layanan" className="footer-link">Makalah & Review Paper</a></li>
                <li><a href="#layanan" className="footer-link">Esai Beasiswa & Opini</a></li>
                <li><a href="#layanan" className="footer-link">Tugas Teknik & Pemrograman</a></li>
              </ul>
            </div>

            {/* Column 3: Jaminan & Standar */}
            <div>
              <div className="footer-heading">Standar & Garansi</div>
              <ul className="footer-links">
                <li className="footer-link">🛡️ 100% Kerahasiaan Data</li>
                <li className="footer-link">📊 Lolos Turnitin Resmi</li>
                <li className="footer-link">🔄 Garansi Revisi Sampai ACC</li>
                <li className="footer-link">⚡ Jalur Kilat 24-48 Jam</li>
                <li className="footer-link">👨‍🏫 Tim Lulusan PTN Ternama</li>
              </ul>
            </div>

            {/* Column 4: Navigasi & Admin */}
            <div>
              <div className="footer-heading">Bantuan & Kontak</div>
              <ul className="footer-links">
                <li>
                  <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="footer-link" style={{ color: 'var(--success)', fontWeight: 600 }}>
                    💬 WhatsApp Admin
                  </a>
                </li>
                <li><a href="#pricelist" className="footer-link">Cek Pricelist Terbuka</a></li>
                <li><a href="#testimoni" className="footer-link">Screenshot Bukti ACC</a></li>
                <li><a href="#faq" className="footer-link">Tanya Jawab (FAQ)</a></li>
                <li>
                  <a href="/admin" className="footer-link" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    🔒 Login Portal Admin
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Sub-Footer Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} <strong>Bryz Academic Support</strong>. Hak Cipta Dilindungi Undang-Undang.
            </p>
            <div className="footer-bottom-links">
              <span className="footer-bottom-link">Privasi Terjaga</span>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <span className="footer-bottom-link">Bebas Plagiasi</span>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <a href="/admin" className="footer-bottom-link">Admin Console</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== QRIS PAYMENT MODAL ===================== */}
      {showQrisModal && (
        <div className="modal-overlay" onClick={() => setShowQrisModal(false)}>
          <div className="qris-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Pembayaran QRIS Resmi
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Terverifikasi
                </span>
              </div>
              <button
                onClick={() => setShowQrisModal(false)}
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
              <div className="qris-merchant-title">BRYZ ACADEMIC SUPPORT</div>
              <div className="qris-merchant-sub">NMID: ID1024329012398 • Merchant Resmi</div>

              {/* QR Image or Fallback SVG */}
              <div style={{ margin: '18px 0', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                {config.qrisImageUrl ? (
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <a
                href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Halo Admin Bryz Academic Support, saya ingin mengonfirmasi pembayaran tugas via QRIS. Berikut saya lampirkan bukti transfernya:')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                </svg>
                <span>Kirim Bukti Pembayaran</span>
              </a>
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="btn btn-secondary btn-sm"
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
          onClick={() => setPreviewImage(null)}
          style={{ cursor: 'zoom-out' }}
        >
          <div
            style={{ maxWidth: '85vw', maxHeight: '88vh', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                background: 'var(--accent-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="Bukti Screenshot Testimoni"
              style={{ maxWidth: '100%', maxHeight: '84vh', objectFit: 'contain', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
            />
          </div>
        </div>
      )}

      {/* ===================== FLOATING WHATSAPP BUTTON ===================== */}
      <a
        href={defaultWaLink}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa"
        title="Konsultasi Cepat via WhatsApp"
      >
        <span className="floating-wa-dot" />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z"/>
        </svg>
        <span>Chat Admin WA</span>
      </a>
    </>
  );
}
