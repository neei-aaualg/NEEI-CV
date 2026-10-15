// Stylesheet for the rendered resume. Used for the preview, thumbnails and the PDF export,
// so everything is scoped under .cv-* and sized in mm/pt to print exactly.
export const RESUME_CSS = `
.cv-pages { display: flex; flex-direction: column; gap: 8mm; align-items: center; }
.cv-page {
  position: relative; overflow: hidden; background: #fff; color: #222;
  font-family: var(--body-font); font-size: var(--fs); line-height: var(--lh);
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  box-sizing: border-box; text-align: left; flex: 0 0 auto;
  font-kerning: normal; text-rendering: optimizeLegibility; overflow-wrap: break-word;
}
.cv-page.cv-measurer { position: absolute; left: -10000px; top: 0; height: auto; overflow: visible; visibility: hidden; pointer-events: none; }
.cv-page *, .cv-page *::before, .cv-page *::after { box-sizing: border-box; }
.cv-page p { margin: 0 0 0.35em; }
.cv-page p:last-child { margin-bottom: 0; }
.cv-page ul, .cv-page ol { margin: 0.15em 0 0; padding-left: 1.25em; }
.cv-page li { margin: 0 0 0.12em; padding-left: 0.1em; }
.cv-page a { color: inherit; text-decoration: none; }
.cv-page.cv-links-underline a { text-decoration: underline; }
/* Contact links underline only their text, not the icon or the • / | separators. */
.cv-page.cv-links-underline a.cv-detail { text-decoration: none; }
.cv-page.cv-links-underline a.cv-detail > span:last-child { text-decoration: underline; }
.cv-page.cv-links-blue a { color: #1d4ed8; }

.cv-row { display: flex; align-items: stretch; }
.cv-area { min-width: 0; }
.cv-side-area { flex: 0 0 auto; }
.cv-main-area { flex: 1 1 auto; }

/* Blocks contain their margins so measured heights are exact. Continuations follow the block before them. */
.cv-block { display: flow-root; }
.cv-block:first-child { padding-top: 0 !important; }
.cv-cont-p { padding-top: 0.35em; }
.cv-cont-row { padding-top: 0.45em; }
.cv-cont .cv-desc { margin-top: 0; }
.cv-cont ul, .cv-cont ol { margin-top: 0; }

/* ---------- color areas ---------- */
.cv-area-header .cv-header-top { background: var(--accent); color: #fff; }
.cv-area-sidebar .cv-side-area { background: var(--accent); color: #fff; }
.cv-area-sidebar .cv-header-top { background: var(--accent-dark); color: #fff; }
.cv-frame { position: absolute; inset: 0; border: 2.2mm solid var(--accent); pointer-events: none; }
.cv-on-color, .cv-on-color .cv-heading, .cv-on-color .cv-name, .cv-on-color .cv-title,
.cv-on-color .cv-entry-title, .cv-on-color .cv-entry-sub, .cv-on-color .cv-meta { color: #fff !important; }
.cv-on-color .cv-heading { border-color: rgba(255,255,255,.7) !important; }
.cv-on-color .cv-heading.cv-h-box { background: rgba(255,255,255,.14) !important; }
.cv-on-color .cv-heading.cv-h-bar { border-left-color: #fff !important; }
.cv-on-color .cv-heading.cv-h-underline::after { background: #fff !important; }
.cv-on-color .cv-icon { color: #fff !important; }
.cv-on-color .cv-icon.cv-icon-circle, .cv-on-color .cv-icon.cv-icon-square { background: rgba(255,255,255,.2) !important; }
.cv-on-color .cv-dot.on, .cv-on-color .cv-bar-fill { background: #fff !important; }
.cv-on-color .cv-dot { border-color: #fff !important; }
.cv-on-color .cv-bar { background: rgba(255,255,255,.3) !important; }
.cv-on-color .cv-muted { color: rgba(255,255,255,.85) !important; }

/* ---------- header ---------- */
.cv-header { display: flex; gap: 5mm; align-items: center; }
.cv-header.cv-align-center { flex-direction: column; text-align: center; gap: 3mm; }
.cv-header.cv-in-side { flex-direction: column; align-items: flex-start; gap: 3mm; }
.cv-header.cv-in-side.cv-align-center { align-items: center; }
.cv-header-text { min-width: 0; flex: 1; }
.cv-align-center .cv-header-text { flex: none; width: 100%; }
.cv-name { font-family: var(--name-font); font-size: var(--name-fs); font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; }
.cv-title { font-size: calc(var(--fs) * 1.25); margin-top: 0.15em; font-weight: 600; opacity: .95; }
.cv-details { display: flex; flex-wrap: wrap; gap: 0.35em 1.1em; margin-top: 0.7em; font-size: calc(var(--fs) * 0.95); }
.cv-align-center .cv-details { justify-content: center; }
.cv-in-side .cv-details { flex-direction: column; gap: 0.35em; }
.cv-in-side.cv-align-center .cv-details { align-items: center; }
.cv-detail { display: inline-flex; align-items: center; gap: 0.4em; min-width: 0; word-break: break-word; }
.cv-details.cv-sep-bullet, .cv-details.cv-sep-bar { gap: 0.35em 0; }
.cv-sep-bullet .cv-detail + .cv-detail::before { content: "•"; margin: 0 0.55em; opacity: .7; }
.cv-sep-bar .cv-detail + .cv-detail::before { content: "|"; margin: 0 0.55em; opacity: .55; }
.cv-in-side .cv-sep-bullet .cv-detail + .cv-detail::before, .cv-in-side .cv-sep-bar .cv-detail + .cv-detail::before { display: none; }
.cv-photo { flex: 0 0 auto; object-fit: cover; display: block; }
.cv-photo.cv-gray { filter: grayscale(1); }

.cv-icon { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; width: 1.15em; height: 1.15em; }
.cv-icon svg { width: 100%; height: 100%; display: block; }
.cv-icon.cv-icon-circle { width: 1.6em; height: 1.6em; border-radius: 50%; background: var(--accent); color: #fff !important; padding: 0.3em; }
.cv-icon.cv-icon-outline { width: 1.6em; height: 1.6em; border-radius: 50%; border: 0.25mm solid currentColor; padding: 0.3em; }
.cv-icon.cv-icon-square { width: 1.6em; height: 1.6em; border-radius: 0.3em; background: var(--accent); color: #fff !important; padding: 0.3em; }

/* ---------- headings ---------- */
.cv-heading { font-family: var(--name-font); font-size: var(--h-fs); font-weight: 700; line-height: 1.2; margin-bottom: 0.55em; }
.cv-h-upper { text-transform: uppercase; letter-spacing: 0.06em; }
.cv-h-capitalize { text-transform: capitalize; }
.cv-h-smallcaps { font-variant: small-caps; font-weight: 400; letter-spacing: 0.02em; }
.cv-name-sc .cv-name { font-variant: small-caps; letter-spacing: 0.01em; }
.cv-h-line { border-bottom: 0.3mm solid currentColor; padding-bottom: 0.2em; }
.cv-h-box { background: var(--accent-soft); padding: 0.25em 0.55em; border-radius: 0.6mm; }
.cv-h-bar { border-left: 1.1mm solid var(--accent); padding-left: 0.55em; }
.cv-h-underline::after { content: ""; display: block; width: 12mm; height: 0.7mm; background: var(--accent); margin-top: 0.25em; }

/* ---------- entries ---------- */
.cv-entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.cv-entry-head > :first-child { min-width: 0; }
.cv-entry-title { font-size: var(--entry-fs); font-weight: 700; }
.cv-entry-sub { font-size: var(--entry-fs); }
.cv-sub-below { font-style: italic; }
.cv-meta { white-space: nowrap; text-align: right; font-size: calc(var(--fs) * 0.95); flex: 0 0 auto; }
.cv-meta-below { margin-top: 0.1em; font-size: calc(var(--fs) * 0.92); text-align: left; white-space: normal; }
.cv-muted { color: #555; }
.cv-desc { margin-top: 0.3em; }
.cv-entry-link { display: inline-flex; vertical-align: -0.12em; margin-left: 0.3em; width: 0.9em; height: 0.9em; }
.cv-dl { display: grid; grid-template-columns: 26% 1fr; column-gap: 4mm; }
.cv-dl .cv-meta { text-align: left; white-space: normal; }
.cv-meta-italic .cv-entry-head + .cv-entry-head .cv-meta, .cv-meta-italic .cv-meta-below, .cv-meta-italic .cv-dl .cv-meta div + div { font-style: italic; }

/* ---------- compact sections ---------- */
.cv-list { display: grid; gap: 0.45em 6mm; }
.cv-list.cv-list-2 { grid-template-columns: 1fr 1fr; }
.cv-item { display: flex; justify-content: space-between; align-items: center; gap: 3mm; min-width: 0; }
.cv-item-text { min-width: 0; }
.cv-item-name { font-weight: 600; }
.cv-item-sub { font-size: calc(var(--fs) * 0.92); }
.cv-level { display: inline-flex; gap: 0.25em; flex: 0 0 auto; }
.cv-dot { width: 0.62em; height: 0.62em; border-radius: 50%; border: 0.25mm solid var(--level-color); }
.cv-dot.on { background: var(--level-color); }
.cv-bar { width: 16mm; height: 1.3mm; border-radius: 1mm; background: #e5e7eb; overflow: hidden; flex: 0 0 auto; }
.cv-bar-fill { display: block; height: 100%; background: var(--level-color); }
.cv-skill-line b { font-weight: 700; }
.cv-cont-line { padding-top: 0.15em; }
.cv-inline { display: flex; flex-wrap: wrap; gap: 0.3em 0; }
.cv-inline > span + span::before { content: "•"; margin: 0 0.5em; opacity: .6; }

/* ---------- accents ---------- */
.acc-name .cv-name, .acc-title .cv-title, .acc-headings .cv-heading, .acc-dates .cv-meta,
.acc-entryTitle .cv-entry-title, .acc-entrySubtitle .cv-entry-sub, .acc-headerIcons .cv-header .cv-icon:not(.cv-icon-circle):not(.cv-icon-square),
.acc-linkIcons .cv-entry-link { color: var(--accent); }
.acc-headingLine .cv-h-line { border-bottom-color: var(--accent); }

/* ---------- footer ---------- */
.cv-footer { position: absolute; left: 0; right: 0; display: flex; justify-content: space-between; gap: 4mm; font-size: calc(var(--fs) * 0.85); color: #666; }
`;

/** Extra rules for the standalone document sent to the PDF renderer or the print dialog. */
export function printCss([w, h]) {
  return `
@page { size: ${w}mm ${h}mm; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; }
.cv-pages { display: block; gap: 0; }
.cv-page { page-break-after: always; break-after: page; box-shadow: none !important; }
.cv-page:last-child { page-break-after: auto; break-after: auto; }
`;
}
