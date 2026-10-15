// All CVs live in this browser's localStorage. The store autosaves (debounced, flushed when the
// page is hidden) and follows changes made in other tabs.
import { createContext } from "preact";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { normalizeResume, uid } from "../builder/data.js";

export const STORAGE_KEY = "neei-cv:v1";
const SAVE_DELAY_MS = 300;

export function loadResumes(storage = localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY));
    if (raw && Array.isArray(raw.resumes)) return raw.resumes.map((r) => normalizeResume(r)).filter(Boolean);
  } catch { /* storage unavailable or corrupt */ }
  return [];
}

function persist(resumes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, resumes }));
    return true;
  } catch {
    return false; // quota exceeded (photos) or storage blocked
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [resumes, setResumes] = useState(() => loadResumes());
  const [saveError, setSaveError] = useState(false);
  const latest = useRef(resumes);
  const dirty = useRef(false);
  const fromOtherTab = useRef(false);
  latest.current = resumes;

  const flush = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    setSaveError(!persist(latest.current));
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    // Nothing changed yet on mount, and saving here could overwrite a newer write from another tab.
    if (!mounted.current) { mounted.current = true; return; }
    if (fromOtherTab.current) { fromOtherTab.current = false; return; }
    dirty.current = true;
    const t = setTimeout(flush, SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [resumes]);

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      fromOtherTab.current = true;
      setResumes(loadResumes());
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const api = useMemo(() => {
    /** Replaces one resume with fn(current). Returning the same object is a no-op. */
    const transform = (id, fn) => setResumes((list) => {
      const i = list.findIndex((r) => r.id === id);
      if (i < 0) return list;
      const next = fn(list[i]);
      if (next === list[i]) return list;
      const copy = list.slice();
      copy[i] = next;
      return copy;
    });
    return {
      transform,
      /** Applies mutate(draft) to a copy of the resume. */
      update: (id, mutate) => transform(id, (r) => {
        const draft = structuredClone(r);
        mutate(draft);
        draft.updatedAt = Date.now();
        return draft;
      }),
      add(resume) {
        const r = normalizeResume({ ...resume, id: uid(), createdAt: Date.now(), updatedAt: Date.now() });
        setResumes((list) => [r, ...list]);
        return r;
      },
      remove: (id) => setResumes((list) => list.filter((r) => r.id !== id)),
      flush,
    };
  }, []);

  const value = useMemo(() => ({ resumes, saveError, ...api }), [resumes, saveError, api]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
