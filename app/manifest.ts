import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WeddingWithIndia",
    short_name: "WeddingWithIndia",
    description:
      "The world's first marketplace to attend authentic Indian weddings as an honoured guest.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#FAF7F2",
    theme_color: "#7B1113",
    categories: ["travel", "lifestyle", "events"],
    shortcuts: [
      {
        name: "Explore Weddings",
        short_name: "Weddings",
        description: "Browse all curated celebrations across India",
        url: "/weddings",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Destinations",
        short_name: "Destinations",
        description: "Explore authentic wedding destinations",
        url: "/#countries",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Host Your Wedding",
        short_name: "Host",
        description: "List your wedding celebration",
        url: "/list-wedding",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "My Dashboard",
        short_name: "Dashboard",
        description: "Manage your bookings and guest passes",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
