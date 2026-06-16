import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DROPLY — 소셜 아트 드롭",
    short_name: "DROPLY",
    description: "발견 × 커뮤니티 × 한정 드롭",
    start_url: "/",
    display: "standalone",
    background_color: "#131313",
    theme_color: "#131313",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
