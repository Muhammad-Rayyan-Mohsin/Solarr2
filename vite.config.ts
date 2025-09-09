import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "set-cache-control",
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog",
          ],
          supabase: ["@supabase/supabase-js"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
