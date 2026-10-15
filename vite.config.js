import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// In development the PDF endpoint runs inside the Vite server, so `npm run dev` is fully functional.
function pdfApi() {
  return {
    name: "neei-cv-pdf-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url.split("?")[0];
        if (path !== "/api/pdf" && path !== "/health") return next();
        const { handleApi } = await import("./server/api.js");
        if (!(await handleApi(req, res, path))) next();
      });
    },
  };
}

export default defineConfig({
  plugins: [preact(), pdfApi()],
  server: { port: 5173 },
  build: {
    outDir: "dist",
    target: "es2022",
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{js,jsx}"],
  },
});
