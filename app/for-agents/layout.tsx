import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Travel Agents',
  description: 'Join our partner program. Earn 7% commission on guest referrals by connecting travelers with Indian weddings.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
