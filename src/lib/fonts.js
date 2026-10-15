// Loads the fonts a resume design uses: Google Fonts stylesheets once each, bundled fonts on first use.
import { useEffect } from "preact/hooks";
import { designFonts, fontsHref, FONTS, LOCAL_FONTS } from "../builder/data.js";

const loading = new Map();

function loadStylesheet(href) {
  if (!loading.has(href)) {
    loading.set(href, new Promise((resolve) => {
      const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
      link.onload = link.onerror = () => resolve();
      document.head.append(link);
    }));
  }
  return loading.get(href);
}

/** Resolves once the design's fonts are usable (or failed to load; text then uses the fallback stack). */
export async function loadFonts(design) {
  const names = [...new Set(designFonts(design))];
  const href = fontsHref(names);
  if (href) await loadStylesheet(href);
  const faces = names.flatMap((n) => [`400 12px "${n}"`, `700 12px "${n}"`, `italic 400 12px "${n}"`]);
  await Promise.race([
    Promise.all(faces.map((f) => document.fonts.load(f).catch(() => {}))),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);
}

export function useResumeFonts(designs) {
  const key = designs.map((d) => designFonts(d).join("|")).join(",");
  useEffect(() => { designs.forEach((d) => loadFonts(d)); }, [key]);
}

/** Loads every font at regular weight so a font list can show each name in its own font. */
export function loadFontPreviews() {
  const google = Object.keys(FONTS).filter((n) => !(n in LOCAL_FONTS));
  const href = `https://fonts.googleapis.com/css2?${google.map((n) => `family=${encodeURIComponent(n).replace(/%20/g, "+")}`).join("&")}&display=swap`;
  loadStylesheet(href);
  Object.keys(LOCAL_FONTS).forEach((n) => document.fonts.load(`400 14px "${n}"`).catch(() => {}));
}
