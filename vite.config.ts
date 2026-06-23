import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "icons/192_192.png", "icons/512_512.png"],
      manifest: {
        name: "Mazda Control",
        short_name: "Mazda Control",
        description: "Control personal de mantenimiento y estado del Mazda 6",
        theme_color: "#7f1d1d",
        background_color: "#09090b",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/192_192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/512_512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/512_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
      },
    }),
  ],
});