import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../client/src"),
        "@shared": path.resolve(__dirname, "../shared"),
        "@assets": path.resolve(__dirname, "../attached_assets"),
      },
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
      hmr: {
        overlay: true,
      },
    },
    root: path.resolve(__dirname, "../client"),
    build: {
      outDir: path.resolve(__dirname, "../dist/public"),
      emptyOutDir: true,
    },
  };
});