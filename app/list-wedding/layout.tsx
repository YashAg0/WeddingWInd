import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Wedding',
  description: 'Share your wedding celebration with the world. List your Indian wedding on WeddingWithIndia and earn while celebrating.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
