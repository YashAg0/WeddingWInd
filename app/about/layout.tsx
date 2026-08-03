import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about WeddingWithIndia\'s mission to connect global travelers with authentic Indian wedding celebrations.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
