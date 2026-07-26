import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Security ────────────────────────────────────────────────────────────
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Disable browser features not used by the app
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // XSS protection (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // HTTP Strict Transport Security (1 year)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Content Security Policy
          // Configured for Clerk, Stripe, UploadThing, and Google Analytics
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js inline scripts + Clerk + Cloudflare CAPTCHA + Google Analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.com https://clerk.weddingwithindia.com https://challenges.cloudflare.com https://www.googletagmanager.com",
              // Worker scripts for Clerk token management & UploadThing
              "worker-src 'self' blob: https://*.clerk.accounts.dev https://*.clerk.com",
              // Styles: inline (Tailwind) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + Unsplash + Pravatar + Clerk avatars + UploadThing
              "img-src 'self' data: blob: https://images.unsplash.com https://i.pravatar.cc https://img.clerk.com https://*.clerk.com https://uploadthing.com https://utfs.io https://www.google-analytics.com",
              // Connections: API + Clerk + Stripe + UploadThing + WebSockets (HMR)
              "connect-src 'self' ws: wss: https://api.clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.com https://clerk.weddingwithindia.com https://api.stripe.com https://uploadthing.com https://www.google-analytics.com https://analytics.google.com",
              // Frames: Stripe embedded elements + Clerk
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
              // Scripts in frames
              "frame-ancestors 'none'",
              // Form submissions
              "form-action 'self'",
              ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
            ].join("; "),
          },
        ],
      },
      // No cache for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },

  // ─── Performance ─────────────────────────────────────────────────────────
  compress: true,

  // ─── Images ──────────────────────────────────────────────────────────────
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
        pathname: "/**",
      },
    ],
  },
  // ─── Transpile Packages ───────────────────────────────────────────────────
  transpilePackages: [],
};

export default nextConfig;
