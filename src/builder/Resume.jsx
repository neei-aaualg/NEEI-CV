// Renders a resume as real-size pages. Content is measured off-screen, then poured into pages
// column by column, so the preview, the thumbnails and the PDF all share one layout.
// Long entries are split into paragraphs / list items so they can continue on the next page.
import { useLayoutEffect, useRef, useState, useEffect } from "preact/hooks";
import { SECTION_TYPES, DETAIL_TYPES, dateRange, fontStack, label } from "./data.js";
import { splitHtml, isEmptyHtml, toHref } from "./html.js";

export const PAGE_SIZES = { A4: [210, 297], Letter: [215.9, 279.4] };
const CSS_PX_PER_MM = 96 / 25.4;

// ---------- icons (simple line icons, 24px grid; inline so they print) ----------
const PATHS = {
  email: "M3 6h18v12H3z M3 7l9 6 9-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
  location: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z",
  website: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z",
  linkedin: "M4 4h16v16H4z M8 10.5V16 M8 7.6v.1 M11.5 16v-5.5 M11.5 12.8c0-1.4 1-2.3 2.3-2.3s2.2.9 2.2 2.3V16",
  github: "M9 19c-4 1.3-4-2-6-2.5 M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  birth: "M4 20h16v-8H4z M4 15c2 1.5 4 1.5 6 0s4-1.5 6 0 3 1.5 4 0 M12 12V8 M12 5.5v.1",
  nationality: "M5 21V4 M5 4h11l-2 4 2 4H5",
  license: "M3 16l2-6h14l2 6v3H3z M7 19v1 M17 19v1 M6.5 16h.1 M17.5 16h.1",
  custom: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z",
};

export function CvIcon({ name, className = "" }) {
  return (
    <span class={`cv-icon ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {(PATHS[name] ?? PATHS.custom).split(" M").map((d, i) => <path d={i ? `M${d}` : d} />)}
      </svg>
    </span>
  );
}

// ---------- pieces ----------
function Level({ value, design }) {
  if (!value || design.levelStyle === "none") return null;
  if (design.levelStyle === "bar") {
    return <span class="cv-bar"><span class="cv-bar-fill" style={{ width: `${value * 20}%` }} /></span>;
  }
  return <span class="cv-level">{[1, 2, 3, 4, 5].map((i) => <span class={`cv-dot${i <= value ? " on" : ""}`} />)}</span>;
}

function Heading({ section, design }) {
  const cls = ["cv-heading", `cv-h-${design.headingStyle}`, design.headingCase !== "none" && `cv-h-${design.headingCase}`].filter(Boolean).join(" ");
  return <div class={cls}>{section.heading}</div>;
}

/** `html` must already be sanitized (splitHtml does that). */
const Desc = ({ html }) => <div class="cv-desc" dangerouslySetInnerHTML={{ __html: html }} />;

function Entry({ entry, type, design, inSide, desc }) {
  const cfg = SECTION_TYPES[type];
  const dates = cfg.dates ? dateRange(entry, design) : "";
  const href = entry.link ? toHref(entry.link) : "";
  const link = href ? (
    <a href={href} class="cv-entry-link" title={entry.link}>{design.linkIcon ? <CvIcon name="link" /> : null}</a>
  ) : null;
  const title = <span class="cv-entry-title">{entry.title}{link}</span>;
  const sameLine = design.subtitlePlacement === "same-line" && entry.subtitle;
  const sub = entry.subtitle ? <span class={`cv-entry-sub${sameLine ? "" : " cv-sub-below"}`}>{sameLine && entry.title ? `, ${entry.subtitle}` : entry.subtitle}</span> : null;
  const body = desc ? <Desc html={desc} /> : null;

  if (design.entryLayout === "dates-left" && !inSide) {
    return (
      <div class="cv-entry cv-dl">
        <div class="cv-meta cv-muted">{dates && <div>{dates}</div>}{entry.location && <div>{entry.location}</div>}</div>
        <div>
          <div>{title}{sameLine ? sub : null}</div>
          {!sameLine && sub && <div>{sub}</div>}
          {body}
        </div>
      </div>
    );
  }
  if (design.datePosition === "below" || inSide) {
    const meta = [dates, entry.location].filter(Boolean).join(" · ");
    return (
      <div class="cv-entry">
        <div>{title}{sameLine ? sub : null}</div>
        {!sameLine && sub && <div>{sub}</div>}
        {meta && <div class="cv-meta cv-meta-below cv-muted">{meta}</div>}
        {body}
      </div>
    );
  }
  return (
    <div class="cv-entry">
      <div class="cv-entry-head">
        <div>{title}{sameLine ? sub : null}</div>
        {dates && <div class="cv-meta">{dates}</div>}
      </div>
      {(!sameLine && sub) || entry.location ? (
        <div class="cv-entry-head">
          <div>{!sameLine && sub}</div>
          {entry.location && <div class="cv-meta cv-muted">{entry.location}</div>}
        </div>
      ) : null}
      {body}
    </div>
  );
}

function ListRow({ items, design, two }) {
  return (
    <div class={`cv-list${two ? " cv-list-2" : ""}`}>
      {items.map((e) => (
        <div class="cv-item">
          <div class="cv-item-text">
            <div class="cv-item-name">{e.title}</div>
            {e.subtitle && <div class="cv-item-sub cv-muted">{e.subtitle}</div>}
          </div>
          <Level value={e.level} design={design} />
        </div>
      ))}
    </div>
  );
}

const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

/**
 * Splits the visible sections of one column into page-breakable blocks.
 * A block is { id, node, cont? } where `cont` ("p" | "li" | "row") marks a continuation of the block before it.
 */
export function buildBlocks(resume, column, design) {
  const blocks = [];
  const twoCols = design.columns === "two";
  const inSide = twoCols && column === "side";
  const datesLeft = design.entryLayout === "dates-left" && !inSide;
  for (const s of resume.sections) {
    if (s.hidden) continue;
    if (twoCols ? (s.column ?? "main") !== column : column !== "main") continue;
    const cfg = SECTION_TYPES[s.type];
    if (!cfg) continue;
    const heading = <Heading section={s} design={design} />;

    if (cfg.text) {
      splitHtml(s.text).forEach((p, i) => blocks.push(i === 0
        ? { id: s.id, node: <>{heading}<Desc html={p.html} /></> }
        : { id: `${s.id}:${i}`, cont: p.kind, node: <Desc html={p.html} /> }));
      continue;
    }

    const entries = s.entries.filter((e) => !e.hidden && (e.title || e.subtitle || (cfg.description && !isEmptyHtml(e.description))));
    if (!entries.length) continue;

    if (cfg.compact) {
      if (s.type === "interests") {
        const inline = <div class="cv-inline">{entries.map((e) => <span>{e.title}{e.subtitle ? ` (${e.subtitle})` : ""}</span>)}</div>;
        blocks.push({ id: s.id, node: <>{heading}{inline}</> });
        continue;
      }
      if (design.compactLayout === "lines") {
        // Like a LaTeX skills block: "Label: items" lines; entries without details are joined with commas.
        const lines = [];
        let plain = [];
        const flush = () => { if (plain.length) lines.push(<div class="cv-skill-line">{plain.join(", ")}</div>); plain = []; };
        for (const e of entries) {
          if (!e.subtitle) { plain.push(e.title); continue; }
          flush();
          lines.push(<div class="cv-skill-line">{e.title && <><b>{e.title}</b>: </>}{e.subtitle}</div>);
        }
        flush();
        lines.forEach((node, i) => blocks.push(i === 0 ? { id: s.id, node: <>{heading}{node}</> } : { id: `${s.id}:l${i}`, cont: "line", node }));
        continue;
      }
      chunk(entries, inSide ? 1 : 2).forEach((row, i) => {
        const node = <ListRow items={row} design={design} two={!inSide} />;
        blocks.push(i === 0 ? { id: s.id, node: <>{heading}{node}</> } : { id: `${s.id}:r${i}`, cont: "row", node });
      });
      continue;
    }

    entries.forEach((e, i) => {
      const pieces = cfg.description ? splitHtml(e.description) : [];
      const entryNode = <Entry entry={e} type={s.type} design={design} inSide={inSide} desc={pieces[0]?.html} />;
      // The heading always travels with the first entry so it is never stranded at a page bottom.
      blocks.push({ id: `${s.id}:${e.id}`, node: i === 0 ? <>{heading}{entryNode}</> : entryNode });
      pieces.slice(1).forEach((p, j) => {
        const desc = <Desc html={p.html} />;
        blocks.push({ id: `${s.id}:${e.id}:${j + 1}`, cont: p.kind, node: datesLeft ? <div class="cv-dl"><div /><div>{desc}</div></div> : desc });
      });
    });
  }
  return blocks;
}

function Header({ resume, design, inSide }) {
  const p = resume.personal;
  const details = [
    p.email && { icon: "email", text: p.email, href: toHref(p.email) },
    p.phone && { icon: "phone", text: p.phone, href: toHref(p.phone) },
    p.location && { icon: "location", text: p.location },
    ...(p.details ?? []).filter((d) => d.value).map((d) => ({ icon: d.type in PATHS ? d.type : "custom", text: d.value, href: DETAIL_TYPES[d.type]?.link ? toHref(d.value) : null })),
  ].filter(Boolean);
  const iconClass = { circle: "cv-icon-circle", outline: "cv-icon-outline", square: "cv-icon-square" }[design.iconStyle] ?? "";
  const showIcons = design.detailsStyle === "icon";
  const photo = design.photoShow && p.photo ? (
    <img class={`cv-photo${design.photoGray ? " cv-gray" : ""}`} src={p.photo} alt=""
      style={{ width: `${design.photoSize}mm`, height: `${design.photoSize}mm`, borderRadius: design.photoShape === "circle" ? "50%" : design.photoShape === "rounded" ? "3mm" : "0" }} />
  ) : null;
  return (
    <div class={`cv-header cv-align-${design.headerAlign}${inSide ? " cv-in-side" : ""}`}>
      {photo}
      <div class="cv-header-text">
        {p.name && <div class="cv-name">{p.name}</div>}
        {p.title && <div class="cv-title">{p.title}</div>}
        {details.length > 0 && (
          <div class={`cv-details${showIcons ? "" : ` cv-sep-${design.detailsStyle}`}`}>
            {details.map((d) => {
              const content = <>{showIcons && <CvIcon name={d.icon} className={iconClass} />}<span>{d.text}</span></>;
              return d.href ? <a class="cv-detail" href={d.href}>{content}</a> : <span class="cv-detail">{content}</span>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- geometry ----------
function geometry(design) {
  const [W, H] = PAGE_SIZES[design.page] ?? PAGE_SIZES.A4;
  const mx = design.marginX, my = design.marginY;
  const twoCols = design.columns === "two";
  const inner = 4.5; // gap between columns is 2 × inner
  const sideW = twoCols ? (W * design.sideWidth) / 100 : 0;
  const sideOnLeft = design.sideSide === "left";
  const headerTop = !twoCols || design.headerPosition === "top";
  const footer = design.footerPageNumbers || design.footerName || design.footerEmail;
  const footerReserve = footer ? 7 : 0;
  const mainContentW = twoCols ? W - sideW - mx - inner : W - 2 * mx;
  const sideContentW = twoCols ? sideW - mx - inner : 0;
  return { W, H, mx, my, inner, twoCols, sideW, sideOnLeft, headerTop, footerReserve, mainContentW, sideContentW };
}

function cssVars(design) {
  const fs = design.fontSize;
  return {
    "--accent": design.accent,
    "--accent-soft": `color-mix(in srgb, ${design.accent} 14%, white)`,
    "--accent-dark": `color-mix(in srgb, ${design.accent} 80%, black)`,
    "--level-color": design.accentOn.levels ? design.accent : "#333",
    "--body-font": fontStack(design.bodyFont),
    "--name-font": fontStack(design.nameFont === "same" ? design.bodyFont : design.nameFont),
    "--fs": `${fs}pt`,
    "--name-fs": `${fs + design.nameOffset}pt`,
    "--h-fs": `${fs + design.headingOffset}pt`,
    "--entry-fs": `${fs + design.entryOffset}pt`,
    "--lh": design.lineHeight,
  };
}

function pageClasses(design) {
  const acc = Object.entries(design.accentOn).filter(([, v]) => v).map(([k]) => `acc-${k}`);
  return [
    "cv-page", `cv-area-${design.colorArea}`, design.linkUnderline && "cv-links-underline", design.linkBlue && "cv-links-blue",
    design.nameSmallCaps && "cv-name-sc", design.metaItalic && "cv-meta-italic", ...acc,
  ].filter(Boolean).join(" ");
}

/**
 * Greedy pagination of measured blocks; heights in mm. `gap` is the space above a block,
 * which is dropped when the block starts a page. Returns arrays of block ids, one per page.
 */
export function paginate(blocks, capacity) {
  const pages = [[]];
  let used = 0;
  for (const b of blocks) {
    const page = pages[pages.length - 1];
    const h = page.length ? b.h + b.gap : b.h;
    if (page.length && used + h > capacity(pages.length - 1) + 0.01) {
      pages.push([b.id]);
      used = b.h;
    } else {
      page.push(b.id);
      used += h;
    }
  }
  return pages;
}

let fontsTick = 0;
const fontListeners = new Set();
if (typeof document !== "undefined" && document.fonts) {
  const bump = () => { fontsTick++; fontListeners.forEach((f) => f(fontsTick)); };
  document.fonts.ready.then(bump);
  document.fonts.addEventListener?.("loadingdone", bump);
}

/** Re-renders when web fonts finish loading, since text metrics change. */
function useFontsTick() {
  const [tick, setTick] = useState(fontsTick);
  useEffect(() => {
    fontListeners.add(setTick);
    return () => fontListeners.delete(setTick);
  }, []);
  return tick;
}

// ---------- the document ----------
export function ResumePages({ resume, design = resume.design, onLayout, maxPages = Infinity }) {
  const g = geometry(design);
  const measureRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const fontTick = useFontsTick();
  const [shownTick, setShownTick] = useState(0);

  const mainBlocks = buildBlocks(resume, "main", design);
  const sideBlocks = g.twoCols ? buildBlocks(resume, "side", design) : [];
  const signature = JSON.stringify([resume.personal, resume.sections, design, fontTick, shownTick]);

  // While an ancestor is display:none nothing can be measured; lay out again once it is shown.
  useEffect(() => {
    let wasHidden = false;
    const ro = new ResizeObserver(([e]) => {
      const hidden = e.contentRect.width === 0;
      if (wasHidden && !hidden) setShownTick((t) => t + 1);
      wasHidden = hidden;
    });
    ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const mm = root.querySelector(".cv-mm").getBoundingClientRect().width / 100;
    if (!mm) return; // hidden: keep the previous layout until it can be measured
    // Layout height, not the on-screen box: a rotated ancestor (the tilted pages on the home page) would inflate it.
    const heightOf = (el) => parseFloat(getComputedStyle(el).height) / CSS_PX_PER_MM;
    // Each block's height excludes its top padding (the gap), which paginate() adds back when needed.
    const read = (sel) => [...root.querySelectorAll(`${sel} > .cv-block`)].map((el) => {
      const gap = (parseFloat(getComputedStyle(el).paddingTop) || 0) / CSS_PX_PER_MM;
      return { id: el.dataset.id, h: heightOf(el) - gap, gap };
    });
    const headerEl = root.querySelector(".cv-measure-header");
    const headerH = headerEl ? heightOf(headerEl) : 0;

    const topHeaderH = g.headerTop ? headerH : 0;
    const sideHeaderH = !g.headerTop ? headerH + design.gap : 0;
    const bodyPadTop = (page) => (page === 0 && g.headerTop && topHeaderH ? 5 : g.my);
    const base = (page) => g.H - bodyPadTop(page) - g.my - g.footerReserve - (page === 0 && g.headerTop ? topHeaderH : 0);

    const mainPages = paginate(read(".cv-measure-main"), (p) => base(p));
    const sidePages = paginate(read(".cv-measure-side"), (p) => base(p) - (p === 0 ? sideHeaderH : 0));
    const pageCount = Math.max(mainPages.length, g.twoCols ? sidePages.length : 1, 1);
    const next = { signature, mainPages, sidePages, pageCount, topHeaderH, bodyPadTop: [bodyPadTop(0), bodyPadTop(1)] };
    setLayout((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [signature]);

  useEffect(() => { if (layout) onLayout?.(layout); }, [layout]);

  const byId = (blocks) => new Map(blocks.map((b) => [b.id, b]));
  const mainMap = byId(mainBlocks), sideMap = byId(sideBlocks);
  const blockEl = (b) => (
    <div key={b.id} class={`cv-block${b.cont ? ` cv-cont cv-cont-${b.cont}` : ""}`} data-id={b.id} style={b.cont ? undefined : { paddingTop: `${design.gap}mm` }}>
      {b.node}
    </div>
  );
  const vars = cssVars(design);
  const sideOnColor = design.colorArea === "sidebar";
  const headerOnColor = design.colorArea === "header" || design.colorArea === "sidebar";

  // Off-screen measuring copy, same widths and styles as the real pages.
  const measurer = (
    <div ref={measureRef} class={`${pageClasses(design)} cv-measurer`} style={{ ...vars, width: `${g.W}mm` }} aria-hidden="true">
      <div class="cv-mm" style={{ width: "100mm", height: 0 }} />
      <div class={`cv-measure-header ${(headerOnColor && g.headerTop) || (sideOnColor && !g.headerTop) ? "cv-on-color" : ""}`}
        style={{ width: `${g.headerTop ? g.W - 2 * g.mx : g.sideContentW}mm`, paddingTop: g.headerTop ? `${g.my}mm` : 0, paddingBottom: g.headerTop && headerOnColor ? "5mm" : 0 }}>
        <Header resume={resume} design={design} inSide={!g.headerTop} />
      </div>
      <div class="cv-measure-main" style={{ width: `${g.mainContentW}mm` }}>{mainBlocks.map(blockEl)}</div>
      {g.twoCols && <div class={`cv-measure-side${sideOnColor ? " cv-on-color" : ""}`} style={{ width: `${g.sideContentW}mm` }}>{sideBlocks.map(blockEl)}</div>}
    </div>
  );

  if (!layout) return <div class="cv-pages">{measurer}</div>;

  const pages = [];
  const count = Math.min(layout.pageCount, maxPages);
  for (let i = 0; i < count; i++) {
    const padTop = i === 0 ? layout.bodyPadTop[0] : layout.bodyPadTop[1];
    const mainIds = layout.mainPages[i] ?? [];
    const sideIds = layout.sidePages[i] ?? [];
    const headerTop = i === 0 && g.headerTop && (
      <div class={`cv-header-top${headerOnColor ? " cv-on-color" : ""}`} style={{ padding: `${g.my}mm ${g.mx}mm ${headerOnColor ? 5 : 0}mm` }}>
        <Header resume={resume} design={design} />
      </div>
    );
    const bodyH = g.H - (i === 0 && g.headerTop ? layout.topHeaderH : 0);
    const main = (
      <div class="cv-area cv-main-area" style={{
        padding: `${padTop}mm ${g.mx}mm ${g.my}mm`,
        ...(g.twoCols ? (g.sideOnLeft ? { paddingLeft: `${g.inner}mm` } : { paddingRight: `${g.inner}mm` }) : {}),
      }}>
        {mainIds.map((id) => mainMap.get(id)).filter(Boolean).map(blockEl)}
      </div>
    );
    const side = g.twoCols && (
      <div class={`cv-area cv-side-area${sideOnColor ? " cv-on-color" : ""}`} style={{
        width: `${g.sideW}mm`,
        padding: `${padTop}mm ${g.sideOnLeft ? g.inner : g.mx}mm ${g.my}mm ${g.sideOnLeft ? g.mx : g.inner}mm`,
      }}>
        {i === 0 && !g.headerTop && <Header resume={resume} design={design} inSide />}
        {sideIds.map((id) => sideMap.get(id)).filter(Boolean).map(blockEl)}
      </div>
    );
    const footerBits = [design.footerName && resume.personal.name, design.footerEmail && resume.personal.email].filter(Boolean);
    pages.push(
      <div key={i} class={pageClasses(design)} style={{ ...vars, width: `${g.W}mm`, height: `${g.H}mm` }}>
        {headerTop}
        <div class="cv-row" style={{ height: `${bodyH}mm`, flexDirection: g.twoCols && g.sideOnLeft ? "row" : "row-reverse" }}>
          {g.twoCols ? <>{side}{main}</> : main}
        </div>
        {g.footerReserve > 0 && (
          <div class="cv-footer" style={{ bottom: `${Math.max(4, g.my - 7)}mm`, padding: `0 ${g.mx}mm` }}>
            <span>{footerBits.join(" · ")}</span>
            <span>{design.footerPageNumbers ? `${label(design.language, "page")} ${i + 1} / ${layout.pageCount}` : ""}</span>
          </div>
        )}
        {design.colorArea === "border" && <div class="cv-frame" />}
      </div>,
    );
  }

  return <div class="cv-pages">{measurer}{pages}</div>;
}
