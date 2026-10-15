// Light/dark theme for the app chrome (resume pages always stay white), shared key with neei.online.
import { useEffect, useState } from "preact/hooks";

const KEY = "neei_theme";
const isDark = () => document.documentElement.classList.contains("dark");

function apply(dark) {
  document.documentElement.classList.toggle("dark", dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#070d14" : "#fffefb");
  try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch { /* ignore */ }
}

export function useTheme() {
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    // Follow the system setting until the person picks a theme.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = (e) => {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
      if (!saved) document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", onSystem);
    return () => { observer.disconnect(); mq.removeEventListener("change", onSystem); };
  }, []);

  /** Toggles with the same circular reveal as neei.online when the browser supports view transitions. */
  const toggle = (event) => {
    const next = !isDark();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) { apply(next); return; }
    const x = event?.clientX || window.innerWidth / 2;
    const y = event?.clientY || window.innerHeight / 2;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const root = document.documentElement;
    root.classList.add("is-view-transitioning");
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 480, easing: "cubic-bezier(0.2, 0, 0, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
    transition.finished.finally(() => root.classList.remove("is-view-transitioning"));
  };

  return { dark, toggle };
}
