import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/", 
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Meher Ali Family",
        short_name: "Meher Ali Family",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        icons: [
  {
    src: "/pwa-192x192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/logo-512.png",
    sizes: "512x512",
    type: "image/png",
  },
  {
    src: "/logo-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any maskable",
  },
],
      },
    }),
  ],
});
