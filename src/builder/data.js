// Data model for the CV builder: section types, defaults, design presets, fonts and resume labels.

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const SCHEMA_VERSION = 1;

// Each section type: its name in the editor and the label of each field it uses.
// dates: "range" | "single" | undefined
export const SECTION_TYPES = {
  summary: { name: "Resumo", icon: "FileText", text: true },
  experience: { name: "Experiência Profissional", icon: "Briefcase", title: "Cargo", subtitle: "Empresa", location: "Cidade, País", dates: "range", link: true, description: true },
  education: { name: "Formação", icon: "GraduationCap", title: "Curso / Grau", subtitle: "Instituição de ensino", location: "Cidade, País", dates: "range", link: true, description: true },
  skills: { name: "Competências", icon: "Wrench", title: "Competência", subtitle: "Informação / subcompetências", level: true, compact: true },
  languages: { name: "Idiomas", icon: "Languages", title: "Idioma", subtitle: "Informação (ex.: C1)", level: true, compact: true },
  certificates: { name: "Certificados", icon: "BadgeCheck", title: "Certificado", subtitle: "Entidade emissora", dates: "single", link: true, description: true },
  interests: { name: "Interesses", icon: "Heart", title: "Interesse", subtitle: "Informação", compact: true },
  projects: { name: "Projetos", icon: "Rocket", title: "Título do projeto", subtitle: "Subtítulo / função", dates: "range", link: true, description: true },
  courses: { name: "Cursos", icon: "BookOpen", title: "Curso", subtitle: "Instituição", location: "Cidade, País", dates: "range", link: true, description: true },
  awards: { name: "Prémios", icon: "Trophy", title: "Prémio", subtitle: "Entidade emissora", dates: "single", link: true, description: true },
  organisations: { name: "Organizações", icon: "Users", title: "Organização", subtitle: "Cargo", location: "Cidade, País", dates: "range", link: true, description: true },
  publications: { name: "Publicações", icon: "Newspaper", title: "Título da publicação", subtitle: "Editora", dates: "single", link: true, description: true },
  references: { name: "Referências", icon: "UserRound", title: "Nome", subtitle: "Cargo, Empresa", location: "Email / telefone", description: true },
  declaration: { name: "Declaração", icon: "PenLine", text: true },
  custom: { label: "Outro", placeholder: "Outra informação", name: "Secção personalizada", icon: "Sparkles", title: "Título", subtitle: "Subtítulo", location: "Cidade, País", dates: "range", link: true, description: true },
};

export const SECTION_ORDER = Object.keys(SECTION_TYPES);

// Sections that default to the sidebar in two-column layouts.
const SIDE_TYPES = ["skills", "languages", "interests", "certificates", "references"];

// Extra personal details shown under the contacts.
export const DETAIL_TYPES = {
  linkedin: { label: "LinkedIn", placeholder: "linkedin.com/in/o-teu-nome", link: true },
  github: { label: "GitHub", placeholder: "github.com/o-teu-nome", link: true },
  website: { label: "Site", placeholder: "oteusite.pt", link: true },
  birth: { label: "Data de nascimento", placeholder: "01/01/2004" },
  nationality: { label: "Nacionalidade", placeholder: "Portuguesa" },
  license: { label: "Carta de condução", placeholder: "Categoria B" },
  custom: {},
};

// ---------- labels printed on the resume (resume language, not UI language) ----------
const L = {
  en: { present: "Present", summary: "Summary", experience: "Professional Experience", education: "Education", skills: "Skills", languages: "Languages", certificates: "Certificates", interests: "Interests", projects: "Projects", courses: "Courses", awards: "Awards", organisations: "Organisations", publications: "Publications", references: "References", declaration: "Declaration", custom: "Custom Section", page: "Page" },
  pt: { present: "Atual", summary: "Resumo", experience: "Experiência Profissional", education: "Formação", skills: "Competências", languages: "Idiomas", certificates: "Certificados", interests: "Interesses", projects: "Projetos", courses: "Cursos", awards: "Prémios", organisations: "Organizações", publications: "Publicações", references: "Referências", declaration: "Declaração", custom: "Secção Personalizada", page: "Página" },
  es: { present: "Actualidad", summary: "Resumen", experience: "Experiencia Profesional", education: "Educación", skills: "Habilidades", languages: "Idiomas", certificates: "Certificados", interests: "Intereses", projects: "Proyectos", courses: "Cursos", awards: "Premios", organisations: "Organizaciones", publications: "Publicaciones", references: "Referencias", declaration: "Declaración", custom: "Sección Personalizada", page: "Página" },
  fr: { present: "Aujourd'hui", summary: "Profil", experience: "Expérience Professionnelle", education: "Formation", skills: "Compétences", languages: "Langues", certificates: "Certificats", interests: "Centres d'intérêt", projects: "Projets", courses: "Cours", awards: "Distinctions", organisations: "Organisations", publications: "Publications", references: "Références", declaration: "Déclaration", custom: "Section Personnalisée", page: "Page" },
  de: { present: "Heute", summary: "Profil", experience: "Berufserfahrung", education: "Ausbildung", skills: "Kenntnisse", languages: "Sprachen", certificates: "Zertifikate", interests: "Interessen", projects: "Projekte", courses: "Kurse", awards: "Auszeichnungen", organisations: "Organisationen", publications: "Publikationen", references: "Referenzen", declaration: "Erklärung", custom: "Eigener Abschnitt", page: "Seite" },
};
export const LANGUAGES = { pt: "Português", en: "English", es: "Español", fr: "Français", de: "Deutsch" };
export const LOCALES = { en: "en-GB", pt: "pt-PT", es: "es-ES", fr: "fr-FR", de: "de-DE" };
export const label = (lang, key) => (L[lang] ?? L.en)[key] ?? L.en[key] ?? key;

// ---------- dates ----------
export const DATE_FORMATS = {
  "MM/YYYY": "03/2024",
  "MMM YYYY": "Mar 2024",
  "MMMM YYYY": "March 2024",
  "YYYY": "2024",
  "MM.YYYY": "03.2024",
  "YYYY-MM": "2024-03",
};

/** Formats "YYYY-MM" (or "YYYY") in the chosen format and language. Anything else passes through. */
export function formatDate(value, format, lang) {
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(value ?? "");
  if (!m) return value ?? "";
  const [, y, mo] = m;
  if (!mo || format === "YYYY") return y;
  const date = new Date(Number(y), Number(mo) - 1, 1);
  const locale = LOCALES[lang] ?? "en-GB";
  switch (format) {
    case "MMM YYYY": return `${new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(".", "")} ${y}`;
    case "MMMM YYYY": return `${new Intl.DateTimeFormat(locale, { month: "long" }).format(date)} ${y}`;
    case "MM.YYYY": return `${mo}.${y}`;
    case "YYYY-MM": return `${y}-${mo}`;
    default: return `${mo}/${y}`;
  }
}

export function dateRange(entry, design) {
  const f = (v) => formatDate(v, design.dateFormat, design.language);
  const start = f(entry.start);
  const end = entry.current ? label(design.language, "present") : f(entry.end);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || end || "";
}

// ---------- fonts ----------
export const FONTS = {
  Inter: "sans", Lato: "sans", Roboto: "sans", "Open Sans": "sans", "Source Sans 3": "sans", Montserrat: "sans",
  Raleway: "sans", "Work Sans": "sans", "IBM Plex Sans": "sans", "Nunito Sans": "sans", Poppins: "sans",
  Merriweather: "serif", Lora: "serif", Alegreya: "serif", "EB Garamond": "serif", "Playfair Display": "serif",
  "PT Serif": "serif", "Crimson Pro": "serif", "Libre Baskerville": "serif", "Source Serif 4": "serif", "Roboto Slab": "serif",
  "CMU Serif": "serif",
};

// Fonts served from /fonts instead of Google Fonts (CMU Serif is LaTeX's Computer Modern, OFL licence).
export const LOCAL_FONTS = {
  "CMU Serif": [
    { file: "cmu-serif-500-roman.woff2", weight: "100 600", style: "normal" },
    { file: "cmu-serif-500-italic.woff2", weight: "100 600", style: "italic" },
    { file: "cmu-serif-700-roman.woff2", weight: "700 900", style: "normal" },
    { file: "cmu-serif-700-italic.woff2", weight: "700 900", style: "italic" },
  ],
};

/** @font-face rules for the bundled fonts in `names`; `src(face)` gives each face's URL. */
export function localFontCss(names, src = (face) => `/fonts/${face.file}`) {
  return [...new Set(names)].filter((n) => n in LOCAL_FONTS).flatMap((n) => LOCAL_FONTS[n].map((face) =>
    `@font-face { font-family: "${n}"; font-style: ${face.style}; font-weight: ${face.weight}; font-display: swap; src: url("${src(face)}") format("woff2"); }`)).join("\n");
}

export function fontStack(name) {
  return `"${name}", ${FONTS[name] === "serif" ? "Georgia, serif" : "Arial, sans-serif"}`;
}

export function designFonts(design) {
  return [design.bodyFont, design.nameFont === "same" ? design.bodyFont : design.nameFont];
}

export function fontsHref(names) {
  const families = [...new Set(names)].filter((n) => n in FONTS && !(n in LOCAL_FONTS))
    .map((n) => `family=${encodeURIComponent(n).replace(/%20/g, "+")}:ital,wght@0,400;0,600;0,700;1,400`);
  return families.length ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}

export const NEEI_BLUE = "#00668c";
export const ACCENTS = [NEEI_BLUE, "#1f2937", "#1e3a5f", "#2563eb", "#0f766e", "#15803d", "#7c3aed", "#be185d", "#b91c1c", "#c2410c", "#a16207"];

// ---------- design ----------
export const DEFAULT_DESIGN = {
  template: "neei",
  language: "pt",
  dateFormat: "MM/YYYY",
  page: "A4",
  columns: "one",
  sideSide: "left",
  sideWidth: 33,
  headerPosition: "top",
  fontSize: 10,
  nameOffset: 13,
  headingOffset: 2.5,
  entryOffset: 0.5,
  lineHeight: 1.3,
  gap: 4,
  marginX: 16,
  marginY: 14,
  entryLayout: "stacked",
  datePosition: "right",
  subtitlePlacement: "below",
  headingStyle: "line",
  headingCase: "upper",
  nameSmallCaps: false,
  metaItalic: false,
  compactLayout: "grid",
  bodyFont: "Inter",
  nameFont: "same",
  accent: NEEI_BLUE,
  colorArea: "none",
  accentOn: { name: true, title: true, headings: true, headingLine: true, headerIcons: true, dates: false, entryTitle: false, entrySubtitle: false, linkIcons: true, levels: true },
  headerAlign: "left",
  detailsStyle: "icon",
  iconStyle: "plain",
  photoShow: true,
  photoSize: 28,
  photoShape: "circle",
  photoGray: false,
  linkUnderline: false,
  linkBlue: false,
  linkIcon: true,
  levelStyle: "dots",
  footerPageNumbers: false,
  footerName: false,
  footerEmail: false,
};

/** Design templates: one click applies a whole look. Content is never touched. */
export const TEMPLATES = [
  { id: "neei", name: "NEEI", description: "Duas colunas com o azul do NEEI", design: { bodyFont: "Inter", nameFont: "same", accent: NEEI_BLUE, columns: "two", sideSide: "right", sideWidth: 31, headerPosition: "top", colorArea: "none", headingStyle: "underline", headingCase: "upper", headerAlign: "left", detailsStyle: "icon", iconStyle: "circle", entryLayout: "stacked", datePosition: "right", subtitlePlacement: "below", fontSize: 9.5, lineHeight: 1.35, levelStyle: "bar", accentOn: { ...DEFAULT_DESIGN.accentOn, name: false, title: true, dates: true } } },
  // Jake's Resume (LaTeX): Computer Modern, small caps, full-width rules, centred contacts, all black.
  { id: "classic", name: "Clássico", description: "Sóbrio e serifado, ao estilo LaTeX", design: { bodyFont: "CMU Serif", nameFont: "same", accent: "#000000", columns: "one", colorArea: "none", headingStyle: "line", headingCase: "smallcaps", nameSmallCaps: true, headerAlign: "center", detailsStyle: "bar", linkUnderline: true, linkIcon: false, entryLayout: "stacked", datePosition: "right", subtitlePlacement: "below", metaItalic: true, compactLayout: "lines", levelStyle: "none", photoShow: false, fontSize: 10.5, nameOffset: 14, headingOffset: 2.5, entryOffset: 0, lineHeight: 1.2, gap: 2.5, marginX: 13, marginY: 12, accentOn: { name: false, title: false, headings: false, headingLine: false, headerIcons: false, dates: false, entryTitle: false, entrySubtitle: false, linkIcons: false, levels: false } } },
  { id: "modern", name: "Moderno", description: "Uma coluna, limpo e atual", design: { bodyFont: "Inter", nameFont: "same", accent: "#2563eb", columns: "one", colorArea: "none", headingStyle: "line", headingCase: "capitalize", headerAlign: "left", detailsStyle: "icon", entryLayout: "stacked", datePosition: "right", subtitlePlacement: "below", fontSize: 9.5, lineHeight: 1.35, accentOn: { ...DEFAULT_DESIGN.accentOn, name: false, title: true, headings: true, headingLine: true } } },
  { id: "sidebar", name: "Barra lateral", description: "Barra lateral de cor com foto", design: { bodyFont: "Lato", nameFont: "Montserrat", accent: "#1e3a5f", columns: "two", sideSide: "left", sideWidth: 34, headerPosition: "side", colorArea: "sidebar", headingStyle: "line", headingCase: "upper", headerAlign: "left", detailsStyle: "icon", entryLayout: "stacked", datePosition: "right", subtitlePlacement: "below", fontSize: 9.5, lineHeight: 1.35, photoShape: "circle" } },
  { id: "timeline", name: "Cronologia", description: "Datas à esquerda, em cronologia", design: { bodyFont: "IBM Plex Sans", nameFont: "same", accent: "#0f766e", columns: "one", colorArea: "none", headingStyle: "bar", headingCase: "none", headerAlign: "left", detailsStyle: "bar", entryLayout: "dates-left", fontSize: 9.5, lineHeight: 1.35, accentOn: { ...DEFAULT_DESIGN.accentOn, dates: true } } },
  { id: "banner", name: "Faixa", description: "Cabeçalho numa faixa de cor", design: { bodyFont: "Open Sans", nameFont: "Playfair Display", accent: "#7c3aed", columns: "one", colorArea: "header", headingStyle: "box", headingCase: "upper", headerAlign: "center", detailsStyle: "icon", entryLayout: "stacked", datePosition: "right", subtitlePlacement: "same-line", fontSize: 9.5, lineHeight: 1.35 } },
  { id: "compact", name: "Compacto", description: "Denso: cabe mais numa página", design: { bodyFont: "Roboto", nameFont: "Roboto Slab", accent: "#b91c1c", columns: "two", sideSide: "right", sideWidth: 30, headerPosition: "top", colorArea: "border", headingStyle: "plain", headingCase: "upper", headerAlign: "left", detailsStyle: "icon", entryLayout: "stacked", datePosition: "right", subtitlePlacement: "same-line", fontSize: 9, lineHeight: 1.25, gap: 3, marginX: 12, marginY: 11 } },
];

export function applyTemplate(design, id) {
  const t = TEMPLATES.find((x) => x.id === id) ?? TEMPLATES[0];
  const keep = { language: design.language, dateFormat: design.dateFormat, page: design.page };
  return { ...DEFAULT_DESIGN, ...t.design, ...keep, accentOn: { ...DEFAULT_DESIGN.accentOn, ...(t.design.accentOn ?? {}) }, template: t.id };
}

// ---------- resume factories ----------
export const newEntry = () => ({ id: uid(), hidden: false, title: "", subtitle: "", location: "", start: "", end: "", current: false, link: "", level: 0, description: "" });

export function newSection(type, lang = "pt") {
  const s = { id: uid(), type, heading: label(lang, type), hidden: false, column: SIDE_TYPES.includes(type) ? "side" : "main", entries: [], text: "" };
  if (!SECTION_TYPES[type].text) s.entries.push(newEntry());
  return s;
}

function baseResume(name, lang, template) {
  const now = Date.now();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: uid(), name, createdAt: now, updatedAt: now,
    personal: { name: "", title: "", email: "", phone: "", location: "", photo: "", details: [] },
    sections: [],
    design: { ...applyTemplate(DEFAULT_DESIGN, template), language: lang },
  };
}

export function blankResume(name, lang = "pt", template = "neei") {
  const r = baseResume(name, lang, template);
  r.sections = [newSection("summary", lang), newSection("experience", lang), newSection("education", lang), newSection("skills", lang), newSection("languages", lang)];
  return r;
}

const entry = (fields) => ({ ...newEntry(), ...fields });

const EXAMPLE = {
  pt: {
    personal: { name: "Ana Martins", title: "Estudante de Engenharia Informática", email: "ana.martins@exemplo.pt", phone: "+351 912 345 678", location: "Faro, Portugal" },
    summary: "<p>Estudante do 3.º ano de Engenharia Informática na Universidade do Algarve, com interesse em desenvolvimento web e sistemas distribuídos. Gosto de transformar problemas reais em software simples, bem testado e fácil de manter.</p>",
    experience: [
      { title: "Estagiária de Desenvolvimento Web", subtitle: "Empresa Exemplo, Lda.", location: "Faro, Portugal", start: "2026-07", end: "2026-09", description: "<ul><li>Desenvolvi uma área de cliente em <b>React</b> e <b>Node.js</b> usada por mais de 2 000 utilizadores.</li><li>Reduzi o tempo de carregamento da página principal em 40% com otimização de consultas SQL.</li><li>Escrevi testes automáticos que aumentaram a cobertura de 35% para 80%.</li></ul>" },
    ],
    education: [
      { title: "Licenciatura em Engenharia Informática", subtitle: "Universidade do Algarve", location: "Faro, Portugal", start: "2024-09", current: true, description: "<p>Unidades curriculares de destaque: Algoritmos e Estruturas de Dados, Bases de Dados, Redes de Computadores.</p>" },
      { title: "Ensino Secundário — Ciências e Tecnologias", subtitle: "Escola Secundária de Faro", location: "Faro, Portugal", start: "2021-09", end: "2024-06" },
    ],
    organisations: [
      { title: "Núcleo de Estudantes de Engenharia Informática (NEEI)", subtitle: "Vogal da Direção", location: "Faro, Portugal", start: "2025-10", current: true, description: "<ul><li>Organização de workshops técnicos e de uma hackathon com mais de 100 participantes.</li><li>Manutenção das ferramentas digitais do núcleo.</li></ul>" },
    ],
    projects: [
      { title: "Gestor de Horários", subtitle: "Projeto pessoal", start: "2025", link: "github.com/anamartins/horarios", description: "<p>Aplicação web para planear horários semestrais, usada por mais de 200 colegas.</p>" },
    ],
    skills: [["Java", 4], ["Python", 4], ["JavaScript / TypeScript", 4], ["React", 3], ["SQL", 3], ["Git", 4]],
    languages: [["Português", "Nativo", 5], ["Inglês", "C1", 4], ["Espanhol", "B1", 3]],
  },
  en: {
    personal: { name: "Ana Martins", title: "Computer Science Student", email: "ana.martins@example.com", phone: "+351 912 345 678", location: "Faro, Portugal" },
    summary: "<p>Third-year Computer Science student at the University of the Algarve, interested in web development and distributed systems. I enjoy turning real problems into simple, well-tested and maintainable software.</p>",
    experience: [
      { title: "Web Development Intern", subtitle: "Example Company Ltd.", location: "Faro, Portugal", start: "2026-07", end: "2026-09", description: "<ul><li>Built a customer portal in <b>React</b> and <b>Node.js</b> used by more than 2,000 users.</li><li>Cut the home page load time by 40% by optimising SQL queries.</li><li>Wrote automated tests that raised coverage from 35% to 80%.</li></ul>" },
    ],
    education: [
      { title: "BSc in Computer Science and Engineering", subtitle: "University of the Algarve", location: "Faro, Portugal", start: "2024-09", current: true, description: "<p>Highlighted courses: Algorithms and Data Structures, Databases, Computer Networks.</p>" },
      { title: "Secondary Education — Science and Technology", subtitle: "Faro Secondary School", location: "Faro, Portugal", start: "2021-09", end: "2024-06" },
    ],
    organisations: [
      { title: "Computer Science Students' Association (NEEI)", subtitle: "Board Member", location: "Faro, Portugal", start: "2025-10", current: true, description: "<ul><li>Organised technical workshops and a hackathon with more than 100 participants.</li><li>Maintain the association's digital tools.</li></ul>" },
    ],
    projects: [
      { title: "Timetable Planner", subtitle: "Personal project", start: "2025", link: "github.com/anamartins/timetable", description: "<p>Web app for planning semester timetables, used by more than 200 classmates.</p>" },
    ],
    skills: [["Java", 4], ["Python", 4], ["JavaScript / TypeScript", 4], ["React", 3], ["SQL", 3], ["Git", 4]],
    languages: [["Portuguese", "Native", 5], ["English", "C1", 4], ["Spanish", "B1", 3]],
  },
};

export function exampleResume(name, lang = "pt", template = "neei") {
  const x = EXAMPLE[lang] ?? EXAMPLE.en;
  const r = baseResume(name, lang, template);
  r.personal = {
    ...r.personal, ...x.personal,
    details: [{ id: uid(), type: "linkedin", value: "linkedin.com/in/anamartins" }, { id: uid(), type: "github", value: "github.com/anamartins" }],
  };
  const section = (type, fields) => ({ ...newSection(type, lang), ...fields });
  r.sections = [
    section("summary", { text: x.summary }),
    section("experience", { entries: x.experience.map(entry) }),
    section("education", { entries: x.education.map(entry) }),
    section("projects", { entries: x.projects.map(entry) }),
    section("organisations", { entries: x.organisations.map(entry) }),
    section("skills", { entries: x.skills.map(([title, level]) => entry({ title, level })) }),
    section("languages", { entries: x.languages.map(([title, subtitle, level]) => entry({ title, subtitle, level })) }),
  ];
  return r;
}

// ---------- validation ----------
const str = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);
const num = (v, min, max, fallback) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback);

function normalizeDesign(d = {}) {
  const D = DEFAULT_DESIGN;
  const out = { ...D, ...d, accentOn: { ...D.accentOn } };
  for (const k of Object.keys(D.accentOn)) if (typeof d.accentOn?.[k] === "boolean") out.accentOn[k] = d.accentOn[k];
  out.template = pick(d.template, [...TEMPLATES.map((t) => t.id), "custom"], D.template);
  out.language = pick(d.language, Object.keys(LANGUAGES), D.language);
  out.dateFormat = pick(d.dateFormat, Object.keys(DATE_FORMATS), D.dateFormat);
  out.page = pick(d.page, ["A4", "Letter"], D.page);
  out.columns = pick(d.columns, ["one", "two"], D.columns);
  out.sideSide = pick(d.sideSide, ["left", "right"], D.sideSide);
  out.headerPosition = pick(d.headerPosition, ["top", "side"], D.headerPosition);
  out.entryLayout = pick(d.entryLayout, ["stacked", "dates-left"], D.entryLayout);
  out.datePosition = pick(d.datePosition, ["right", "below"], D.datePosition);
  out.subtitlePlacement = pick(d.subtitlePlacement, ["same-line", "below"], D.subtitlePlacement);
  out.headingStyle = pick(d.headingStyle, ["line", "plain", "box", "bar", "underline"], D.headingStyle);
  out.headingCase = pick(d.headingCase, ["none", "capitalize", "upper", "smallcaps"], D.headingCase);
  out.compactLayout = pick(d.compactLayout, ["grid", "lines"], D.compactLayout);
  out.bodyFont = pick(d.bodyFont, Object.keys(FONTS), D.bodyFont);
  out.nameFont = pick(d.nameFont, ["same", ...Object.keys(FONTS)], D.nameFont);
  out.accent = /^#[0-9a-f]{6}$/i.test(d.accent ?? "") ? d.accent : D.accent;
  out.colorArea = pick(d.colorArea, ["none", "header", "sidebar", "border"], D.colorArea);
  if (out.colorArea === "sidebar" && out.columns === "one") out.colorArea = "header";
  out.headerAlign = pick(d.headerAlign, ["left", "center"], D.headerAlign);
  out.detailsStyle = pick(d.detailsStyle, ["icon", "bullet", "bar"], D.detailsStyle);
  out.iconStyle = pick(d.iconStyle, ["plain", "circle", "square", "outline"], D.iconStyle);
  out.photoShape = pick(d.photoShape, ["circle", "rounded", "square"], D.photoShape);
  out.levelStyle = pick(d.levelStyle, ["dots", "bar", "none"], D.levelStyle);
  out.sideWidth = num(d.sideWidth, 24, 45, D.sideWidth);
  out.fontSize = num(d.fontSize, 7, 14, D.fontSize);
  out.nameOffset = num(d.nameOffset, 0, 30, D.nameOffset);
  out.headingOffset = num(d.headingOffset, 0, 8, D.headingOffset);
  out.entryOffset = num(d.entryOffset, 0, 4, D.entryOffset);
  out.lineHeight = num(d.lineHeight, 1, 2, D.lineHeight);
  out.gap = num(d.gap, 0, 12, D.gap);
  out.marginX = num(d.marginX, 5, 35, D.marginX);
  out.marginY = num(d.marginY, 5, 35, D.marginY);
  out.photoSize = num(d.photoSize, 12, 50, D.photoSize);
  for (const k of ["nameSmallCaps", "metaItalic", "photoShow", "photoGray", "linkUnderline", "linkBlue", "linkIcon", "footerPageNumbers", "footerName", "footerEmail"]) out[k] = typeof d[k] === "boolean" ? d[k] : D[k];
  return out;
}

function normalizeEntry(e = {}) {
  return {
    id: str(e.id) || uid(), hidden: !!e.hidden,
    title: str(e.title), subtitle: str(e.subtitle), location: str(e.location),
    start: str(e.start), end: str(e.end), current: !!e.current, link: str(e.link),
    level: num(e.level, 0, 5, 0), description: str(e.description),
  };
}

/**
 * Returns a complete, well-formed resume from any stored or imported object, or null if it isn't one.
 * Unknown section types are dropped, missing fields get defaults, and ids are made unique.
 */
export function normalizeResume(raw, fallbackName = "CV") {
  if (!raw || typeof raw !== "object" || !raw.personal || typeof raw.personal !== "object" || !Array.isArray(raw.sections)) return null;
  const p = raw.personal;
  const seen = new Set();
  const uniq = (id) => { let v = str(id) || uid(); while (seen.has(v)) v = uid(); seen.add(v); return v; };
  const design = normalizeDesign(raw.design);
  return {
    schemaVersion: SCHEMA_VERSION,
    id: str(raw.id) || uid(),
    name: str(raw.name).trim() || fallbackName,
    createdAt: num(raw.createdAt, 0, Infinity, num(raw.updatedAt, 0, Infinity, Date.now())),
    updatedAt: num(raw.updatedAt, 0, Infinity, Date.now()),
    personal: {
      name: str(p.name), title: str(p.title), email: str(p.email), phone: str(p.phone), location: str(p.location),
      photo: /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(p.photo ?? "") ? p.photo : "",
      details: (Array.isArray(p.details) ? p.details : [])
        .filter((d) => d && typeof d === "object")
        .map((d) => ({ id: uniq(d.id), type: d.type in DETAIL_TYPES ? d.type : "custom", value: str(d.value) })),
    },
    sections: raw.sections
      .filter((s) => s && typeof s === "object" && s.type in SECTION_TYPES)
      .map((s) => ({
        id: uniq(s.id), type: s.type,
        heading: typeof s.heading === "string" ? s.heading : label(design.language, s.type),
        hidden: !!s.hidden,
        column: s.column === "side" ? "side" : "main",
        text: str(s.text),
        entries: (Array.isArray(s.entries) ? s.entries : []).filter((e) => e && typeof e === "object").map((e) => ({ ...normalizeEntry(e), id: uniq(e.id) })),
      })),
    design,
  };
}
