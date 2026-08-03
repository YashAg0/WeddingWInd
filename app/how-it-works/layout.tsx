import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Discover how WeddingWithIndia connects global guests with real Indian wedding celebrations in four simple steps.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
