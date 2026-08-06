import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Travel Agents',
  description: 'Join our partner program. Earn tiered commission (₹500-₹500) on guest referrals by connecting travelers with Indian weddings.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
