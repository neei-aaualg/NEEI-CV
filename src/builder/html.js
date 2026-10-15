// Rich-text helpers: sanitizing user HTML, splitting it into page-breakable pieces, and building links.

const ALLOWED = new Set(["B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "P", "BR", "A"]);
const DROP = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "TEMPLATE", "SVG", "MATH", "IMG", "VIDEO", "AUDIO", "FORM", "INPUT", "TEXTAREA", "SELECT", "BUTTON"]);
const SAFE_HREF = /^(https?:|mailto:|tel:)/i;

/** Keeps only simple formatting tags (no attributes except safe link targets); everything else is unwrapped or dropped. */
export function sanitizeHtml(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) continue;
      if (child.nodeType !== 1) { child.remove(); continue; }
      if (DROP.has(child.tagName)) { child.remove(); continue; }
      walk(child);
      const tag = child.tagName === "DIV" ? "P" : child.tagName;
      if (!ALLOWED.has(tag)) { child.replaceWith(...child.childNodes); continue; }
      const clean = doc.createElement(tag);
      if (tag === "A") {
        const href = (child.getAttribute("href") ?? "").trim();
        if (SAFE_HREF.test(href)) clean.setAttribute("href", href);
      }
      clean.append(...child.childNodes);
      child.replaceWith(clean);
    }
  };
  const root = doc.body.firstChild;
  walk(root);
  // Paragraphs nested inside paragraphs (from pasted or div-based markup) are flattened.
  for (const p of [...root.querySelectorAll("p p")]) p.replaceWith(...p.childNodes);
  return root.innerHTML;
}

export const isEmptyHtml = (h) => !h || !h.replace(/<[^>]*>/g, "").replace(/&nbsp;| /g, " ").trim();

const escapeText = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

/**
 * Splits rich text into top-level pieces that may land on different pages:
 * each paragraph is one piece, and each list item is one piece wrapped in its own list
 * (numbered lists keep counting via `start`). Returns [{ kind: "p" | "li", html }].
 */
export function splitHtml(html) {
  const key = html ?? "";
  if (splitCache.has(key)) return splitCache.get(key);
  const pieces = splitUncached(key);
  if (splitCache.size > 1000) splitCache.clear();
  splitCache.set(key, pieces);
  return pieces;
}

const splitCache = new Map();

function splitUncached(html) {
  const clean = sanitizeHtml(html);
  if (isEmptyHtml(clean)) return [];
  const root = new DOMParser().parseFromString(`<div>${clean}</div>`, "text/html").body.firstChild;
  const pieces = [];
  let loose = [];
  const flush = () => {
    const inner = loose.map((n) => (n.nodeType === 3 ? escapeText(n.textContent) : n.outerHTML)).join("");
    if (!isEmptyHtml(inner)) pieces.push({ kind: "p", html: `<p>${inner}</p>` });
    loose = [];
  };
  for (const node of root.childNodes) {
    if (node.nodeType === 1 && (node.tagName === "UL" || node.tagName === "OL")) {
      flush();
      const tag = node.tagName.toLowerCase();
      let n = 0;
      for (const li of node.children) {
        if (li.tagName !== "LI" || isEmptyHtml(li.innerHTML)) continue;
        n++;
        pieces.push({ kind: "li", html: `<${tag}${tag === "ol" ? ` start="${n}"` : ""}>${li.outerHTML}</${tag}>` });
      }
    } else if (node.nodeType === 1 && node.tagName === "P") {
      flush();
      if (!isEmptyHtml(node.innerHTML)) pieces.push({ kind: "p", html: node.outerHTML });
    } else if (node.nodeType === 1 || node.nodeType === 3) {
      loose.push(node);
    }
  }
  flush();
  return pieces;
}

/** Turns what people type (an email, phone, bare domain or URL) into a safe link target. */
export function toHref(value) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (/^[^@\s/]+@[^@\s/]+\.[^@\s/]+$/.test(v)) return `mailto:${v}`;
  if (/^\+?[\d\s().-]{6,}$/.test(v)) return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (SAFE_HREF.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return ""; // javascript:, data:, etc.
  return `https://${v}`;
}
