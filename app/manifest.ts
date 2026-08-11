import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wedding With India",
    short_name: "Wedding With India",
    description: "The world's first marketplace to attend authentic Indian weddings as an honoured guest.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6b1026",
    icons: [
      {
        src: "/images/logos/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
