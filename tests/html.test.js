import { describe, expect, it } from "vitest";
import { sanitizeHtml, splitHtml, toHref, isEmptyHtml } from "../src/builder/html.js";

describe("sanitizeHtml", () => {
  it("keeps simple formatting", () => {
    expect(sanitizeHtml("<p>Hi <b>there</b> <i>you</i> <u>!</u></p>")).toBe("<p>Hi <b>there</b> <i>you</i> <u>!</u></p>");
  });

  it("drops scripts, event handlers and unsafe links", () => {
    const out = sanitizeHtml(`<p onclick="x()">a<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">b</a></p>`);
    expect(out).toBe("<p>a<a>b</a></p>");
  });

  it("keeps http, mailto and tel links only", () => {
    expect(sanitizeHtml('<a href="https://neei.online" target="_blank">x</a>')).toBe('<a href="https://neei.online">x</a>');
    expect(sanitizeHtml('<a href="data:text/html,hi">x</a>')).toBe("<a>x</a>");
  });

  it("unwraps unknown tags and turns divs into paragraphs", () => {
    expect(sanitizeHtml("<div>one</div><span>two</span>")).toBe("<p>one</p>two");
  });
});

describe("splitHtml", () => {
  it("returns nothing for empty text", () => {
    expect(splitHtml("")).toEqual([]);
    expect(splitHtml("<p><br></p>")).toEqual([]);
  });

  it("splits paragraphs and list items into pieces", () => {
    const pieces = splitHtml("<p>Intro</p><ul><li>A</li><li>B</li></ul><p>End</p>");
    expect(pieces.map((p) => p.kind)).toEqual(["p", "li", "li", "p"]);
    expect(pieces[1].html).toBe("<ul><li>A</li></ul>");
  });

  it("keeps numbering of ordered lists", () => {
    const pieces = splitHtml("<ol><li>A</li><li>B</li><li>C</li></ol>");
    expect(pieces.map((p) => p.html)).toEqual(['<ol start="1"><li>A</li></ol>', '<ol start="2"><li>B</li></ol>', '<ol start="3"><li>C</li></ol>']);
  });

  it("wraps loose inline content in a paragraph and escapes text", () => {
    expect(splitHtml("plain &lt;b&gt; <b>bold</b>")).toEqual([{ kind: "p", html: "<p>plain &lt;b&gt; <b>bold</b></p>" }]);
  });
});

describe("toHref", () => {
  it("recognizes emails, phones and bare domains", () => {
    expect(toHref("ana@exemplo.pt")).toBe("mailto:ana@exemplo.pt");
    expect(toHref("+351 912 345 678")).toBe("tel:+351912345678");
    expect(toHref("github.com/ana")).toBe("https://github.com/ana");
    expect(toHref("http://x.pt")).toBe("http://x.pt");
  });

  it("refuses dangerous schemes", () => {
    expect(toHref("javascript:alert(1)")).toBe("");
    expect(toHref("data:text/html,x")).toBe("");
  });
});

describe("isEmptyHtml", () => {
  it("treats whitespace and nbsp as empty", () => {
    expect(isEmptyHtml("<p>&nbsp; </p>")).toBe(true);
    expect(isEmptyHtml("<p>x</p>")).toBe(false);
  });
});
