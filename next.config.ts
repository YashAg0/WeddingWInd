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
          // Adjust 'script-src' when adding third-party analytics
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js inline scripts + Clerk
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.weddingwithindia.com https://challenges.cloudflare.com https://www.googletagmanager.com",
              // Styles: inline (Tailwind) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + Unsplash + Pravatar + Clerk avatars + UploadThing
              "img-src 'self' data: blob: https://images.unsplash.com https://i.pravatar.cc https://img.clerk.com https://uploadthing.com https://utfs.io https://www.google-analytics.com",
              // Connections: API + Clerk + Stripe + UploadThing
              "connect-src 'self' https://api.clerk.com https://clerk.weddingwithindia.com https://api.stripe.com https://uploadthing.com https://www.google-analytics.com https://analytics.google.com",
              // Frames: Stripe embedded elements
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              // Scripts in frames
              "frame-ancestors 'none'",
              // Form submissions
              "form-action 'self'",
              // Upgrade all HTTP to HTTPS
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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

  experimental: {
    // Reduce bundle size by only importing used icons from lucide-react
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // ─── Images ──────────────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
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
};

export default nextConfig;
