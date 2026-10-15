// PDF export: the resume is laid out off-screen with the same renderer as the preview, then the
// paginated HTML goes to /api/pdf (headless Chromium). Printing via the browser is the fallback.
import { render } from "preact";
import { ResumePages, PAGE_SIZES } from "../builder/Resume.jsx";
import { RESUME_CSS, printCss } from "../builder/resume-css.js";
import { designFonts, fontsHref, LOCAL_FONTS, localFontCss } from "../builder/data.js";
import { loadFonts } from "./fonts.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dataUrls = new Map();

function fileAsDataUrl(url) {
  if (!dataUrls.has(url)) {
    dataUrls.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
      return r.blob();
    }).then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    })).catch((err) => { dataUrls.delete(url); throw err; }));
  }
  return dataUrls.get(url);
}

/** Bundled fonts are inlined as data URLs: the PDF renderer only loads Google Fonts and inline data. */
async function inlineLocalFonts(names) {
  const used = [...new Set(names)].filter((n) => n in LOCAL_FONTS);
  const faces = used.flatMap((n) => LOCAL_FONTS[n]);
  const urls = new Map(await Promise.all(faces.map(async (f) => [f.file, await fileAsDataUrl(`/fonts/${f.file}`)])));
  return localFontCss(used, (f) => urls.get(f.file));
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** Renders the resume off-screen and returns a standalone HTML document of its pages. */
export async function resumeHtml(resume) {
  const d = resume.design;
  await loadFonts(d);
  const host = Object.assign(document.createElement("div"), { className: "pdf-host" });
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-20000px;top:0;width:auto;pointer-events:none;";
  document.body.append(host);
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("layout timeout")), 10_000);
      render(<ResumePages resume={resume} onLayout={() => { clearTimeout(timer); resolve(); }} />, host);
    });
    await nextFrame();
    const pages = host.querySelector(".cv-pages").cloneNode(true);
    pages.querySelectorAll(".cv-measurer").forEach((n) => n.remove());
    const fonts = fontsHref(designFonts(d));
    const localFonts = await inlineLocalFonts(designFonts(d));
    return `<!doctype html><html lang="${escapeHtml(d.language)}"><head><meta charset="utf-8"><title>${escapeHtml(resume.personal.name || resume.name || "CV")}</title>
${fonts ? `<link rel="stylesheet" href="${escapeHtml(fonts)}">` : ""}
<style>${localFonts}${RESUME_CSS}${printCss(PAGE_SIZES[d.page] ?? PAGE_SIZES.A4)}</style></head><body>${pages.outerHTML}</body></html>`;
  } finally {
    render(null, host);
    host.remove();
  }
}

export function pdfFileName(resume) {
  const base = (resume.personal.name || resume.name || "CV").trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "").slice(0, 80) || "CV";
  return `${base} - CV.pdf`;
}

export function saveBlob(blob, name) {
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export class PdfError extends Error {
  constructor(message, html) { super(message); this.html = html; }
}

/** Creates and downloads the PDF. On failure throws a PdfError carrying the HTML for printing instead. */
export async function downloadPdf(resume) {
  const html = await resumeHtml(resume);
  let res;
  try {
    res = await fetch("/api/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html }) });
  } catch {
    throw new PdfError("offline", html);
  }
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new PdfError(error || `HTTP ${res.status}`, html);
  }
  saveBlob(await res.blob(), pdfFileName(resume));
}

/** Opens the browser's print dialog for the resume HTML, using a hidden frame (no pop-up needed). */
export function printHtml(html) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.append(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(html);
  doc.close();
  const win = frame.contentWindow;
  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  const go = () => {
    (win.document.fonts?.ready ?? Promise.resolve()).then(() => {
      win.addEventListener("afterprint", cleanup, { once: true });
      win.focus();
      win.print();
      setTimeout(cleanup, 120_000);
    });
  };
  if (doc.readyState === "complete") go();
  else frame.addEventListener("load", go, { once: true });
}

export async function printResume(resume) {
  printHtml(await resumeHtml(resume));
}

export function exportJson(resume) {
  const name = (resume.name || "CV").replace(/[\\/:*?"<>|]+/g, "");
  saveBlob(new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" }), `${name}.json`);
}

/** Reads a JSON file and returns the raw object (validated by the store via normalizeResume). */
export async function readJsonFile(file) {
  if (file.size > 15 * 1024 * 1024) throw new Error("> 15 MB");
  return JSON.parse(await file.text());
}
