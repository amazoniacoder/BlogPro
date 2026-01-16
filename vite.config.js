import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Try to clear the .vite cache directory
try {
  const viteCachePath = path.resolve(__dirname, "node_modules/.vite");
  if (fs.existsSync(viteCachePath)) {
    console.log("Clearing Vite cache directory...");
    fs.rmSync(viteCachePath, { recursive: true, force: true });
    console.log("Vite cache directory cleared.");
  }
} catch (err) {
  console.error("Failed to clear Vite cache:", err);
}

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
  css: {
    devSourcemap: true,
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    hmr: {
      // Use WebSockets for HMR
      protocol: "ws",
      host: "localhost",
      port: 3000,
    },
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
});
