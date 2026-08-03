import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Coordinators',
  description: 'Join WeddingWithIndia as a regional event coordinator. Get paid per event day to help international guests.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
