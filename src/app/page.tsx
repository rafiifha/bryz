import { getServices, getTestimonials, getConfig } from '@/lib/data';
import LandingPage from '@/components/LandingPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const services = await getServices();
  const testimonials = await getTestimonials();
  const config = await getConfig();

  return (
    <LandingPage
      services={services}
      testimonials={testimonials}
      config={config}
    />
  );
}
