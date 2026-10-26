import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        headers: { Origin: "http://localhost:5173" },
      },
      "/ws/chat": {
        target: "ws://localhost:8080",
        ws: true,
        // The local BE currently allows the original Vite development Origin.
        headers: { Origin: "http://localhost:5173" },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@features": "/src/features",
      "@shared": "/src/shared",
      "@pages": "/src/pages",
      "@components": "/src/components",
    },
  },
});
