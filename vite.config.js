import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    chunkSizeWarningLimit: 5000, // Set the limit to 1000 kB
    // rollupOptions: {
    //   external: ["firebase/firestore"],
    // },
  },
});
