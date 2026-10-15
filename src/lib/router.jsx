// Minimal history-API router: "/" is the CV list, "/cv/:id" the editor.
import { useEffect, useState } from "preact/hooks";

const listeners = new Set();
const notify = () => listeners.forEach((f) => f(location.pathname));

export function navigate(to, { replace = false } = {}) {
  if (to === location.pathname) return;
  history[replace ? "replaceState" : "pushState"](null, "", to);
  window.scrollTo(0, 0);
  notify();
}

export function useRoute() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    listeners.add(setPath);
    // Child effects run before this one, so a navigate() during the first render must be picked up here.
    setPath(location.pathname);
    const onPop = () => setPath(location.pathname);
    window.addEventListener("popstate", onPop);
    return () => { listeners.delete(setPath); window.removeEventListener("popstate", onPop); };
  }, []);
  return path;
}

/** Same-origin link that navigates without a page load (modifier clicks still open new tabs). */
export function Link({ href, onClick, ...props }) {
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handle} {...props} />;
}

export const editorPath = (id) => `/cv/${encodeURIComponent(id)}`;

export function matchEditor(path) {
  const m = /^\/cv\/([^/]+)\/?$/.exec(path);
  return m ? decodeURIComponent(m[1]) : null;
}
