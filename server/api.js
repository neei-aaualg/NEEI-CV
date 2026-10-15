// API shared by the production server and the Vite dev server:
//   POST /api/pdf  { html }  -> application/pdf   (headless Chromium prints the builder's paginated HTML)
//   GET  /health             -> { ok: true }
// The builder already lays the resume out in real pages, so the PDF matches the preview page for page.
import { existsSync } from "node:fs";

const MAX_BODY_BYTES = 12 * 1024 * 1024; // photos are inlined as data URLs
const RENDER_TIMEOUT_MS = 30_000;
const MAX_CONCURRENT = Number(process.env.PDF_CONCURRENCY) || 2;
const MAX_QUEUED = 20;
const RATE_LIMIT = Number(process.env.PDF_RATE_LIMIT) || 20; // renders per IP per window
const RATE_WINDOW_MS = 60_000;

const BROWSER_CANDIDATES = [
  process.env.PDF_BROWSER,
  "/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/microsoft-edge",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// ---------- browser ----------
let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const executablePath = BROWSER_CANDIDATES.find((p) => p && existsSync(p));
      if (!executablePath) throw new HttpError(503, "No Chromium, Chrome or Edge found for PDF export (set PDF_BROWSER)");
      const { chromium } = await import("playwright-core");
      const browser = await chromium.launch({
        executablePath,
        headless: true,
        // Containers usually lack the user namespaces Chromium's sandbox needs. Pages run with
        // JavaScript disabled and no network access besides Google Fonts, see renderPdf().
        chromiumSandbox: process.env.CHROMIUM_NO_SANDBOX !== "1",
        args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-first-run", "--no-default-browser-check"],
      });
      browser.on("disconnected", () => { browserPromise = null; });
      return browser;
    })().catch((err) => { browserPromise = null; throw err; });
  }
  return browserPromise;
}

const FONT_HOSTS = ["https://fonts.googleapis.com/", "https://fonts.gstatic.com/"];

async function renderPdf(html) {
  const browser = await getBrowser();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const timer = setTimeout(() => context.close().catch(() => {}), RENDER_TIMEOUT_MS + 5_000);
  try {
    const page = await context.newPage();
    // Only inline data and Google Fonts may load; everything else (trackers, file://, intranet) is blocked.
    await page.route("**/*", (route) => {
      const url = route.request().url();
      const ok = url.startsWith("data:") || FONT_HOSTS.some((h) => url.startsWith(h));
      return ok ? route.continue() : route.abort();
    });
    await page.setContent(html, { waitUntil: "networkidle", timeout: RENDER_TIMEOUT_MS });
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    return await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
  } finally {
    clearTimeout(timer);
    await context.close().catch(() => {});
  }
}

// ---------- concurrency ----------
let active = 0;
const waiting = [];

async function withSlot(fn) {
  if (active >= MAX_CONCURRENT) {
    if (waiting.length >= MAX_QUEUED) throw new HttpError(503, "The PDF service is busy, try again in a moment");
    await new Promise((resolve) => waiting.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

// ---------- rate limit (per client IP, in memory) ----------
const hits = new Map();

function clientIp(req) {
  // Coolify/Traefik put the real client first in X-Forwarded-For.
  const fwd = req.headers["x-forwarded-for"];
  return (typeof fwd === "string" && fwd.split(",")[0].trim()) || req.socket.remoteAddress || "unknown";
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(ip);
}, RATE_WINDOW_MS).unref();

// ---------- http ----------
async function readJson(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, "The resume is too large to export");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

/** Handles API routes. Returns false when the path is not an API route. */
export async function handleApi(req, res, pathname) {
  if (pathname === "/health") {
    sendJson(res, 200, { ok: true });
    return true;
  }
  if (pathname !== "/api/pdf") return false;
  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    if (rateLimited(clientIp(req))) throw new HttpError(429, "Too many PDF exports, wait a minute and try again");
    const { html } = await readJson(req, MAX_BODY_BYTES);
    if (typeof html !== "string" || !html.includes("cv-page")) throw new HttpError(400, "Missing resume HTML");
    const pdf = await withSlot(() => renderPdf(html));
    res.writeHead(200, { "Content-Type": "application/pdf", "Content-Length": pdf.length, "Cache-Control": "no-store" });
    res.end(pdf);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error("[pdf]", err);
    sendJson(res, status, { error: status === 500 ? "Could not create the PDF" : err.message });
  }
  return true;
}

export async function closeBrowser() {
  const browser = await browserPromise?.catch(() => null);
  await browser?.close().catch(() => {});
}
