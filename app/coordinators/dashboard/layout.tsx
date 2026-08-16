import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coordinator Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CoordinatorDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
