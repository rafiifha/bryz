// Types for the application
export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: string;
  imageUrl: string | null;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  order: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SiteConfig {
  whatsappNumber: string;
  heroEyebrow?: string;
  heroTitle: string;
  heroDescription: string;
  totalClients: string;
  totalProjects: string;
  satisfaction: string;
  qrisImageUrl?: string | null;
  logoImageUrl?: string | null;
  skripsiFeatures?: string[];
  faqs?: FaqItem[];
}
