// Undo/redo for one resume, plus the Ctrl+Z / Ctrl+Y shortcuts.
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

const HISTORY_LIMIT = 100;
const COALESCE_MS = 700;

/** `update(mutate, key)` edits the resume; `key` groups rapid edits of the same field into one undo step. */
export function useHistory(store, id) {
  const h = useRef({ past: [], future: [], lastKey: null, lastPush: 0 });
  const [, setVersion] = useState(0);

  const update = useCallback((mutate, key = null) => {
    store.transform(id, (before) => {
      const draft = structuredClone(before);
      mutate(draft);
      draft.updatedAt = Date.now();
      const s = h.current;
      const now = Date.now();
      if (!(key && key === s.lastKey && now - s.lastPush < COALESCE_MS)) {
        s.past.push(before);
        if (s.past.length > HISTORY_LIMIT) s.past.shift();
      }
      s.lastPush = now;
      s.lastKey = key;
      s.future = [];
      return draft;
    });
    setVersion((v) => v + 1);
  }, [id]);

  const step = useCallback((from, to) => {
    store.transform(id, (current) => {
      const s = h.current;
      const snap = s[from].pop();
      if (!snap) return current;
      s[to].push(current);
      s.lastKey = null;
      return { ...snap, updatedAt: Date.now() };
    });
    setVersion((v) => v + 1);
  }, [id]);

  return {
    update,
    undo: () => step("past", "future"),
    redo: () => step("future", "past"),
    canUndo: h.current.past.length > 0,
    canRedo: h.current.future.length > 0,
  };
}

/** Ctrl/Cmd+Z undoes, Ctrl+Y or Ctrl+Shift+Z redoes. Rich-text fields keep their own native undo. */
export function useUndoShortcuts(history) {
  const latest = useRef(history);
  latest.current = history;
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.target.closest?.("[contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); latest.current.undo(); }
      else if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); latest.current.redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
