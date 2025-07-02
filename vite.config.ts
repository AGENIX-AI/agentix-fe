import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sentryVitePlugin({
      org: "edvara",
      project: "javascript-react",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __BUILD_NUMBER__: JSON.stringify(
      process.env.VITE_APP_BUILD_NUMBER || "dev"
    ),
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION || "0.1.0"),
    __LAST_BUILD_DATE__: JSON.stringify(
      process.env.VITE_APP_LAST_BUILD_DATE || "development"
    ),
  },
  server: {
    proxy: {
      "/sentry-tunnel": {
        target: process.env.VITE_API_URL || "http://localhost:8002",
        changeOrigin: true,
      },
    },
  },
});
