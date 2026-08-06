import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Couples',
  description: 'List your Indian wedding on WeddingWithIndia and welcome international guests. Keep 78% of every booking.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
