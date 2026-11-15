import { Testimonial } from './types';

// Testimonials saved before the month field existed belong to November 2026.
export const FALLBACK_TESTIMONIAL_MONTH = '2026-11';

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function isValidMonth(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function getTestimonialMonth(t: Testimonial): string {
  return isValidMonth(t.month) ? t.month : FALLBACK_TESTIMONIAL_MONTH;
}

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  return `${MONTH_NAMES_ID[Number(m) - 1]} ${year}`;
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export interface TestimonialMonthGroup {
  month: string;
  label: string;
  items: Testimonial[];
}

// Earliest month first; inside a month, keep the admin's order.
export function groupTestimonialsByMonth(list: Testimonial[]): TestimonialMonthGroup[] {
  const groups = new Map<string, Testimonial[]>();
  for (const t of list) {
    const key = getTestimonialMonth(t);
    const bucket = groups.get(key);
    if (bucket) bucket.push(t);
    else groups.set(key, [t]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, items]) => ({
      month,
      label: formatMonthLabel(month),
      items: [...items].sort((a, b) => a.order - b.order),
    }));
}
