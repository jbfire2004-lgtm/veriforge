import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
  },
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3020",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      /** Nest workspace API — browser uses :5175 only; internal target :3001 */
      "/nest": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/nest/, ""),
      },
      "/vera": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const host = req.headers.host;
            if (host) {
              proxyReq.setHeader("x-forwarded-host", host);
            }
          });
        },
      },
    },
  },
});
