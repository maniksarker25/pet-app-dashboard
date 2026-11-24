import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Long-cacheable vendor chunks. antd, recharts and the editor are split per page by lazy routes.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
        },
      },
    },
  },
});
