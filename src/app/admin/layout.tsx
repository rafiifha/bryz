import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login — Bryz Academic Support',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
