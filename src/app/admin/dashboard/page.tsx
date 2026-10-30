'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Service, Testimonial, SiteConfig } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';

type Tab = 'services' | 'testimonials' | 'settings';

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);

  // Service form states
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceIcon, setServiceIcon] = useState('📚');
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [serviceImageUrl, setServiceImageUrl] = useState('');

  // Testimonial form states
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialImage, setTestimonialImage] = useState<File | null>(null);

  // QRIS form states
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);

  // Logo form states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchData = useCallback(async () => {
    try {
      const [servRes, testRes, confRes] = await Promise.all([
        fetch('/api/services', { cache: 'no-store' }),
        fetch('/api/testimonials', { cache: 'no-store' }),
        fetch('/api/config', { cache: 'no-store' }),
      ]);
      const [servData, testData, confData] = await Promise.all([
        servRes.json(),
        testRes.json(),
        confRes.json(),
      ]);
      setServices(servData);
      setTestimonials(testData);
      setConfig(confData);
      try {
        localStorage.setItem('bryz_services', JSON.stringify(servData));
        localStorage.setItem('bryz_testimonials', JSON.stringify(testData));
        localStorage.setItem('bryz_site_config', JSON.stringify(confData));
      } catch {}
    } catch {
      showToast('Gagal memuat data dari database', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (!savedToken) {
      router.push('/admin');
      return;
    }
    setToken(savedToken);
    fetchData();
  }, [router, fetchData]);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload file gagal');
    const data = await res.json();
    return data.url;
  };

  const openAddService = () => {
    setEditingService(null);
    setServiceName('');
    setServiceDesc('');
    setServicePrice('Mulai Rp 500.000 / Konsultasi');
    setServiceIcon('📚');
    setServiceImage(null);
    setServiceImageUrl('');
    setShowServiceModal(true);
  };

  const openEditService = (s: Service) => {
    setEditingService(s);
    setServiceName(s.name);
    setServiceDesc(s.description);
    setServicePrice(s.price);
    setServiceIcon(s.icon);
    setServiceImage(null);
    setServiceImageUrl(s.imageUrl || '');
    setShowServiceModal(true);
  };

  const saveService = async () => {
    if (!serviceName.trim() || !serviceDesc.trim()) {
      showToast('Nama dan deskripsi layanan wajib diisi', 'error');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = serviceImageUrl;
      if (serviceImage) {
        imageUrl = await uploadFile(serviceImage);
      }

      if (editingService) {
        await fetch('/api/services', {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            id: editingService.id,
            name: serviceName,
            description: serviceDesc,
            price: servicePrice,
            icon: serviceIcon,
            imageUrl,
          }),
        });
        showToast('Layanan berhasil diperbarui', 'success');
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            name: serviceName,
            description: serviceDesc,
            price: servicePrice,
            icon: serviceIcon,
            imageUrl,
          }),
        });
        showToast('Layanan baru berhasil ditambahkan', 'success');
      }

      setShowServiceModal(false);
      fetchData();
    } catch {
      showToast('Gagal menyimpan layanan ke database', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteServiceHandler = async (id: string, name: string) => {
    if (!confirm(`Hapus layanan "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menghapus layanan dari server');
      }
      setServices((prev) => {
        const next = prev.filter((s) => s.id !== id);
        try { localStorage.setItem('bryz_services', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast(`Layanan "${name}" berhasil dihapus`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus layanan', 'error');
    }
  };

  const openAddTestimonial = () => {
    setTestimonialName('');
    setTestimonialRating(5);
    setTestimonialImage(null);
    setShowTestimonialModal(true);
  };

  const saveTestimonial = async () => {
    if (!testimonialName.trim() || !testimonialImage) {
      showToast('Nama klien dan file screenshot wajib disertakan', 'error');
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await uploadFile(testimonialImage);
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: testimonialName,
          imageUrl,
          rating: testimonialRating,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan testimoni ke database');
      }
      showToast('Screenshot testimoni berhasil ditambahkan', 'success');
      setShowTestimonialModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengunggah testimoni', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteTestimonialHandler = async (id: string) => {
    if (!confirm('Hapus screenshot testimoni ini?')) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menghapus testimoni dari server');
      }
      setTestimonials((prev) => {
        const next = prev.filter((t) => t.id !== id);
        try { localStorage.setItem('bryz_testimonials', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast('Testimoni berhasil dihapus', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus testimoni', 'error');
    }
  };

  const saveSettings = async () => {
    if (!config) return;
    setSaving(true);
    try {
      let finalConfig = { ...config };
      if (qrisFile) {
        const uploadedUrl = await uploadFile(qrisFile);
        finalConfig.qrisImageUrl = uploadedUrl;
      }
      if (logoFile) {
        const uploadedLogoUrl = await uploadFile(logoFile);
        finalConfig.logoImageUrl = uploadedLogoUrl;
      }
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(finalConfig),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan pengaturan ke server');
      }
      setConfig(finalConfig);
      try {
        localStorage.setItem('bryz_site_config', JSON.stringify(finalConfig));
      } catch {}
      setQrisFile(null);
      setQrisPreview(null);
      setLogoFile(null);
      setLogoPreview(null);
      showToast('Pengaturan website berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px', borderWidth: '3px' }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Memuat Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent-primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>Bryz Admin</div>
              <span style={{ fontSize: '0.68rem', color: 'var(--success)', fontWeight: 600 }}>● Online</span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Sidebar Nav */}
        <ul className="admin-nav">
          <li>
            <a
              href="#"
              className={activeTab === 'services' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setActiveTab('services'); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Layanan & Joki</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.74rem', background: 'var(--tag-bg)', color: 'var(--tag-text)', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                {services.length}
              </span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'testimonials' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setActiveTab('testimonials'); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Screenshot Testimoni</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.74rem', background: 'var(--tag-bg)', color: 'var(--tag-text)', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                {testimonials.length}
              </span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Pengaturan & WA</span>
            </a>
          </li>

          {/* Quick Links */}
          <li style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Lihat Website</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'var(--danger)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Keluar (Logout)</span>
            </a>
          </li>
        </ul>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="admin-main">
        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Layanan Aktif
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {services.length}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
              Siap melayani order
            </span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SS Testimoni
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {testimonials.length}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 500 }}>
              Bukti kepuasan klien
            </span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              WhatsApp Gateway
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'monospace' }}>
              +{config?.whatsappNumber || '628...'}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 500 }}>
              Terkoneksi ke tombol web
            </span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Penyimpanan Database
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              <span>Vercel Blob / Storage</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Dual mode (Cloud & Lokal)
            </span>
          </div>
        </div>

        {/* ===================== TAB 1: SERVICES ===================== */}
        {activeTab === 'services' && (
          <div>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Kelola Layanan Bantuan Akademik</h1>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Atur daftar layanan, harga awal, deskripsi, dan ikon yang tampil di Landing Page.
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openAddService}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Tambah Layanan Baru</span>
              </button>
            </div>

            <div className="table-card">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Layanan & Ikon</th>
                      <th style={{ width: '36%' }}>Deskripsi Cakupan</th>
                      <th style={{ width: '16%' }}>Harga Terpasang</th>
                      <th style={{ width: '8%' }}>Gambar</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.sort((a, b) => a.order - b.order).map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: 'var(--tag-bg)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.25rem',
                              flexShrink: 0,
                            }}>
                              {s.icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.94rem' }}>{s.name}</div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Urutan: #{s.order}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: '400px' }}>
                            {s.description}
                          </p>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            background: 'var(--tag-bg)',
                            color: 'var(--accent-primary)',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            whiteSpace: 'nowrap',
                          }}>
                            {s.price}
                          </span>
                        </td>
                        <td>
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt={s.name} style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Default</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditService(s)}
                              title="Edit Layanan"
                              style={{ padding: '6px 10px' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteServiceHandler(s.id, s.name)}
                              title="Hapus Layanan"
                              style={{ padding: '6px 10px' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: TESTIMONIALS ===================== */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Screenshot Testimoni Klien</h1>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Unggah tangkapan layar chat WhatsApp, persetujuan ACC dosen, atau skor Turnitin untuk meyakinkan calon klien.
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openAddTestimonial}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Upload Screenshot Baru</span>
              </button>
            </div>

            {testimonials.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '60px 24px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--tag-bg)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Belum Ada Screenshot Testimoni</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px' }}>
                  Unggah bukti chat atau hasil ACC pertama Anda agar calon klien semakin percaya pada layanan Bryz Academic.
                </p>
                <button className="btn btn-primary btn-sm" onClick={openAddTestimonial}>
                  <span>Upload Screenshot Sekarang</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {testimonials.map((t) => (
                  <div key={t.id} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{ position: 'relative', height: '200px', background: 'var(--bg-secondary)' }}>
                      <img
                        src={t.imageUrl}
                        alt={`Testimoni ${t.name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--tag-text)', background: 'var(--tag-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                          Jenis Joki Dikerjakan
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                          {t.name}
                        </div>
                        <div style={{ color: '#f59e0b', fontSize: '0.84rem', marginTop: '2px' }}>
                          {'★'.repeat(t.rating)}
                        </div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteTestimonialHandler(t.id)}
                        title="Hapus Screenshot"
                        style={{ padding: '6px 10px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: SETTINGS ===================== */}
        {activeTab === 'settings' && config && (
          <div style={{ maxWidth: '800px' }}>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Pengaturan Website & Integrasi</h1>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Konfigurasikan nomor WhatsApp penerima order dan teks pemasaran utama.
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    <span>Simpan Pengaturan</span>
                  </>
                )}
              </button>
            </div>

            {/* Logo Brand Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Logo Brand Website (Header &amp; Footer)</h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Ganti teks default &quot;Bryz Academic&quot; dengan logo gambar perusahaan Anda.
                  </p>
                </div>
              </div>

              {(logoPreview || config.logoImageUrl) && (
                <div style={{ marginBottom: '18px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={logoPreview || config.logoImageUrl || ''}
                      alt="Preview Logo"
                      style={{ maxHeight: '42px', maxWidth: '160px', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Logo Gambar Terpasang
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Logo ini tampil pada bilah navigasi atas (header) dan bagian footer website.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, logoImageUrl: null });
                        setLogoFile(null);
                        setLogoPreview(null);
                        showToast('Logo dihapus (kembali ke teks default). Klik "Simpan Pengaturan" untuk menyimpan', 'success');
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Hapus Logo (Pakai Teks Default)
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {config.logoImageUrl ? 'Ganti dengan File Logo Baru' : 'Pilih File Logo Gambar'}
                </label>
                <input
                  type="file"
                  className="form-file-input"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLogoFile(file);
                    if (file) {
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Disarankan file PNG berlatar transparan (transparan background) atau SVG dengan tinggi rasio horizontal agar terlihat bersih di header.
                </span>
              </div>
            </div>

            {/* WhatsApp Integration Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.77 14.07c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.32-.78-2.62-1.09-4.3-3.76-4.43-3.93-.13-.18-1.06-1.41-1.06-2.69s.67-1.91.91-2.17c.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.23.55.78 1.9.85 2.04.07.14.12.3.02.48-.09.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.13.58.17.28.74 1.22 1.58 1.97 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.71-.17 1.38z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Nomor WhatsApp Admin</h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Semua tombol pemesanan di web mengarah ke nomor ini.</p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nomor WhatsApp (Gunakan kode negara, contoh: 6281234567890)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="6281234567890"
                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '1rem' }}
                  />
                  <a
                    href={`https://wa.me/${config.whatsappNumber}?text=Tes+koneksi+admin+Bryz`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Cek apakah tautan WhatsApp berfungsi"
                  >
                    <span>Uji Kirim Chat</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* QRIS Payment Code Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Foto / Barcode QRIS Toko</h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Upload foto barcode QRIS pembayaran (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay) untuk ditampilkan pada popup pembayaran web.
                  </p>
                </div>
              </div>

              {(qrisPreview || config.qrisImageUrl) && (
                <div style={{ marginBottom: '18px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <img
                    src={qrisPreview || config.qrisImageUrl || ''}
                    alt="Preview Barcode QRIS"
                    style={{ width: '100px', height: '100px', objectFit: 'contain', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Foto QRIS Terpasang
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Klien dapat melakukan scan langsung pada barcode ini di web.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, qrisImageUrl: null });
                        setQrisFile(null);
                        setQrisPreview(null);
                        showToast('Foto QRIS dihapus, klik "Simpan Pengaturan" untuk menyimpan', 'success');
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Hapus Foto QRIS
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {config.qrisImageUrl ? 'Ganti dengan Foto QRIS Baru' : 'Pilih Foto / Screenshot Barcode QRIS'}
                </label>
                <input
                  type="file"
                  className="form-file-input"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setQrisFile(file);
                    if (file) {
                      setQrisPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Format yang didukung: JPG, PNG, WebP. Pastikan barcode jelas dan mudah terbaca kamera.
                </span>
              </div>
            </div>

            {/* Hero Copywriting Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Konten Headline Utama (Hero Section)</h3>
              <div className="form-group">
                <label className="form-label">Judul Utama Hero</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.heroTitle}
                  onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deskripsi / Sub-headline Hero</label>
                <textarea
                  className="form-textarea"
                  value={config.heroDescription}
                  onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                />
              </div>
            </div>

            {/* Stats Metrics Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-xs)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Statistik Kinerja yang Ditampilkan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Klien Terbantu</label>
                  <input
                    type="text"
                    className="form-input"
                    value={config.totalClients}
                    onChange={(e) => setConfig({ ...config, totalClients: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Tugas Terselesaikan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={config.totalProjects}
                    onChange={(e) => setConfig({ ...config, totalProjects: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tingkat Kepuasan ACC</label>
                  <input
                    type="text"
                    className="form-input"
                    value={config.satisfaction}
                    onChange={(e) => setConfig({ ...config, satisfaction: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== MODAL: TAMBAH / EDIT LAYANAN ===================== */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingService ? 'Edit Data Layanan' : 'Tambah Layanan Akademik Baru'}
              </h2>
              <button
                onClick={() => setShowServiceModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Nama Layanan / Jenis Joki</label>
              <input
                type="text"
                className="form-input"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Contoh: Bimbingan Skripsi Bab 1-5"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Estimasi Harga Tampilan</label>
                <input
                  type="text"
                  className="form-input"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="Mulai Rp 500.000 / Konsultasi"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Simbol Ikon (Emoji)</label>
                <input
                  type="text"
                  className="form-input"
                  value={serviceIcon}
                  onChange={(e) => setServiceIcon(e.target.value)}
                  placeholder="📚"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi Lengkap Cakupan Layanan</label>
              <textarea
                className="form-textarea"
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                placeholder="Jelaskan ruang lingkup pengerjaan, software yang dipakai, atau jaminan revisi..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Upload Gambar / Banner Layanan (Opsional)</label>
              <input
                type="file"
                className="form-file-input"
                accept="image/*"
                onChange={(e) => setServiceImage(e.target.files?.[0] || null)}
              />
              {serviceImageUrl && !serviceImage && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={serviceImageUrl}
                    alt="Preview"
                    style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gambar saat ini terpasang</span>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowServiceModal(false)}>
                Batal
              </button>
              <button className="btn btn-primary btn-sm" onClick={saveService} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Layanan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: UPLOAD TESTIMONI ===================== */}
      {showTestimonialModal && (
        <div className="modal-overlay" onClick={() => setShowTestimonialModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Unggah Screenshot Testimoni Baru
              </h2>
              <button
                onClick={() => setShowTestimonialModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Jenis Joki / Layanan yang Dikerjakan</label>
              <input
                type="text"
                className="form-input"
                value={testimonialName}
                onChange={(e) => setTestimonialName(e.target.value)}
                placeholder="Contoh: Skripsi Bab 1-5 (ACC Sidang) / Jurnal SINTA 2"
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {services.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTestimonialName(`${s.name} (ACC)`)}
                    style={{
                      background: 'var(--tag-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--tag-text)',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    + {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rating Kepuasan</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTestimonialRating(star)}
                    style={{
                      fontSize: '1.4rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: star <= testimonialRating ? '#f59e0b' : 'var(--text-muted)',
                      padding: '2px',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">File Gambar Screenshot Bukti Chat / ACC</label>
              <input
                type="file"
                className="form-file-input"
                accept="image/*"
                onChange={(e) => setTestimonialImage(e.target.files?.[0] || null)}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowTestimonialModal(false)}>
                Batal
              </button>
              <button className="btn btn-primary btn-sm" onClick={saveTestimonial} disabled={saving}>
                {saving ? 'Mengunggah...' : 'Upload Screenshot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success' ? '✓ ' : '✕ '} {toast.message}
        </div>
      )}
    </div>
  );
}
