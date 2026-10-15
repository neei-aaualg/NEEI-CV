// Production server: serves the Vite build from dist/ (SPA fallback) and the PDF API.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleApi, closeBrowser } from "./server/api.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com", // data: for bundled fonts inlined in the print document
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

async function fileIfExists(file) {
  try {
    return (await stat(file)).isFile() ? file : null;
  } catch {
    return null;
  }
}

async function serveStatic(req, res, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname).replace(/^\/+/, "");
  } catch {
    rel = "";
  }
  const requested = path.resolve(DIST, rel || "index.html");
  const inside = requested === DIST || requested.startsWith(DIST + path.sep);
  let file = inside ? await fileIfExists(requested) : null;
  // Client-side routes (/, /cv/abc) fall back to the app; missing assets are real 404s.
  if (!file && !path.extname(rel)) file = path.join(DIST, "index.html");
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...SECURITY_HEADERS });
    return res.end("Not found");
  }
  const body = await readFile(file);
  const hashed = file.startsWith(path.join(DIST, "assets") + path.sep);
  const font = file.startsWith(path.join(DIST, "fonts") + path.sep);
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream",
    "Cache-Control": hashed ? "public, max-age=31536000, immutable" : font ? "public, max-age=2592000" : "no-cache",
    ...SECURITY_HEADERS,
  });
  res.end(req.method === "HEAD" ? undefined : body);
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://localhost");
    if (await handleApi(req, res, pathname)) return;
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Method not allowed");
    }
    await serveStatic(req, res, pathname);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal server error");
  }
});

server.requestTimeout = 60_000;
server.listen(PORT, HOST, () => console.log(`NEEI CV running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.close();
    await closeBrowser();
    process.exit(0);
  });
}
