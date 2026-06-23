import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "48_48.png", "192_192.png", "512_512.png"],
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
            src: "/48_48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "/192_192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/512_512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/512_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
      },
    }),
  ],
});