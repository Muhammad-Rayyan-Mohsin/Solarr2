import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: 'set-cache-control',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
