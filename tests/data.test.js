import { describe, expect, it } from "vitest";
import {
  applyTemplate, blankResume, dateRange, DEFAULT_DESIGN, exampleResume, formatDate, normalizeResume, SECTION_TYPES, TEMPLATES,
} from "../src/builder/data.js";
import { paginate } from "../src/builder/Resume.jsx";
import { loadResumes, STORAGE_KEY } from "../src/lib/store.jsx";

describe("dates", () => {
  it("formats in each format and language", () => {
    expect(formatDate("2024-03", "MM/YYYY", "pt")).toBe("03/2024");
    expect(formatDate("2024-03", "MMMM YYYY", "pt")).toBe("março 2024");
    expect(formatDate("2024-03", "MMM YYYY", "en")).toBe("Mar 2024");
    expect(formatDate("2024-03", "YYYY", "en")).toBe("2024");
    expect(formatDate("2024", "MM/YYYY", "en")).toBe("2024");
    expect(formatDate("Summer 2019", "MM/YYYY", "en")).toBe("Summer 2019");
  });

  it("builds ranges with Present in the CV language", () => {
    const design = { ...DEFAULT_DESIGN, language: "pt" };
    expect(dateRange({ start: "2024-09", current: true }, design)).toBe("09/2024 – Atual");
    expect(dateRange({ start: "2024-09", end: "2025-06" }, design)).toBe("09/2024 – 06/2025");
    expect(dateRange({ start: "2025", end: "2025" }, design)).toBe("2025");
    expect(dateRange({}, design)).toBe("");
  });
});

describe("templates", () => {
  it("keep language, date format and page size", () => {
    const d = applyTemplate({ ...DEFAULT_DESIGN, language: "de", dateFormat: "YYYY", page: "Letter" }, "classic");
    expect([d.language, d.dateFormat, d.page, d.template]).toEqual(["de", "YYYY", "Letter", "classic"]);
  });

  it("all produce valid designs", () => {
    for (const t of TEMPLATES) {
      const r = { ...blankResume("x"), design: applyTemplate(DEFAULT_DESIGN, t.id) };
      expect(normalizeResume(r).design).toEqual(r.design);
    }
  });
});

describe("normalizeResume", () => {
  it("rejects things that are not resumes", () => {
    expect(normalizeResume(null)).toBe(null);
    expect(normalizeResume({ personal: {} })).toBe(null);
    expect(normalizeResume("hello")).toBe(null);
  });

  it("is stable for well-formed resumes", () => {
    const r = exampleResume("Exemplo", "pt");
    expect(normalizeResume(r)).toEqual(r);
  });

  it("repairs partial and hostile data", () => {
    const r = normalizeResume({
      name: "  ",
      personal: { name: 42, photo: "javascript:alert(1)", details: [{ type: "evil", value: "x" }, null] },
      sections: [
        { type: "nope" },
        { id: "a", type: "experience", entries: [{ id: "e", title: "T", level: 99 }, "junk"] },
        { id: "a", type: "skills", column: "side" },
      ],
      design: { accent: "red; background:url(x)", fontSize: 1000, columns: "three", accentOn: { name: "yes" } },
    }, "Fallback");
    expect(r.name).toBe("Fallback");
    expect(r.personal.name).toBe("42");
    expect(r.personal.photo).toBe("");
    expect(r.personal.details).toHaveLength(1);
    expect(r.personal.details[0].type).toBe("custom");
    expect(r.sections.map((s) => s.type)).toEqual(["experience", "skills"]);
    expect(new Set(r.sections.map((s) => s.id)).size).toBe(2);
    expect(r.sections[0].entries).toHaveLength(1);
    expect(r.sections[0].entries[0].level).toBe(5);
    expect(r.sections[1].column).toBe("side");
    expect(r.design.accent).toBe(DEFAULT_DESIGN.accent);
    expect(r.design.fontSize).toBe(14);
    expect(r.design.columns).toBe(DEFAULT_DESIGN.columns);
    expect(r.design.accentOn.name).toBe(DEFAULT_DESIGN.accentOn.name);
  });

  it("covers every section type in the example factories", () => {
    for (const lang of ["pt", "en"]) {
      const r = exampleResume("x", lang);
      for (const s of r.sections) expect(SECTION_TYPES[s.type]).toBeTruthy();
    }
  });
});

describe("paginate", () => {
  const block = (id, h, gap = 4) => ({ id, h, gap });

  it("fills pages and drops the gap at the top of a page", () => {
    const pages = paginate([block("a", 50, 0), block("b", 40), block("c", 30)], () => 100);
    expect(pages).toEqual([["a", "b"], ["c"]]);
  });

  it("uses per-page capacity", () => {
    const pages = paginate([block("a", 60, 0), block("b", 60), block("c", 60)], (p) => (p === 0 ? 70 : 200));
    expect(pages).toEqual([["a"], ["b", "c"]]);
  });

  it("puts an oversized block on its own page instead of looping", () => {
    expect(paginate([block("a", 10, 0), block("big", 500), block("c", 10)], () => 100)).toEqual([["a"], ["big"], ["c"]]);
  });
});

describe("loadResumes", () => {
  const storage = (value) => ({ getItem: (k) => (k === STORAGE_KEY ? value : null) });

  it("survives missing or corrupt storage", () => {
    expect(loadResumes(storage(null))).toEqual([]);
    expect(loadResumes(storage("{not json"))).toEqual([]);
    expect(loadResumes({ getItem() { throw new Error("blocked"); } })).toEqual([]);
  });

  it("drops invalid entries and keeps valid ones", () => {
    const good = exampleResume("Ok", "en");
    const list = loadResumes(storage(JSON.stringify({ version: 1, resumes: [good, { junk: true }] })));
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(good.id);
  });
});
