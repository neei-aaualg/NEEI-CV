// Select field whose list looks like the app's dropdown menus. The list is rendered in a portal with
// fixed positioning, so modals and scrolling panels can't clip it.
// options: [{ value, label, style? }] with optional { group: "Label" } separators.
import { createPortal } from "preact/compat";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "preact/hooks";
import { Check, ChevronDown } from "lucide-preact";

const MAX_HEIGHT = 300;
const norm = (s) => String(s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function Select({ value, onChange, options, label, disabled, placeholder = "", className = "", onOpen }) {
  const id = useId();
  const items = options.filter((o) => !("group" in o));
  const selected = items.find((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [active, setActiveState] = useState(0);
  const activeRef = useRef(0); // read by key handlers, which can fire before a re-render
  const setActive = (n) => { activeRef.current = n; setActiveState(n); };
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  const list = useRef(null);
  const typed = useRef({ text: "", at: 0 });

  const place = () => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const up = below < Math.min(MAX_HEIGHT, 200) && above > below;
    setPos({
      left: Math.min(r.left, window.innerWidth - Math.max(r.width, 180) - 8),
      minWidth: r.width,
      maxHeight: Math.max(140, Math.min(MAX_HEIGHT, up ? above : below)),
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
    });
  };

  const show = () => {
    if (disabled) return;
    place();
    setActive(Math.max(0, items.indexOf(selected)));
    setOpen(true);
    onOpen?.();
  };
  const hide = (refocus = true) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };
  const choose = (o) => {
    if (o.value !== value) onChange(o.value);
    hide();
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    const onDown = (e) => !list.current?.contains(e.target) && !btn.current?.contains(e.target) && hide(false);
    const onScroll = (e) => !list.current?.contains(e.target) && place();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const typeAhead = (key) => {
    const now = Date.now();
    const t = typed.current;
    t.text = (now - t.at < 700 ? t.text : "") + key;
    t.at = now;
    const i = items.findIndex((o) => norm(o.label).startsWith(norm(t.text)));
    if (i >= 0) setActive(i);
  };

  const onListKey = (e) => {
    const active = activeRef.current;
    const last = items.length - 1;
    const moves = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: last, PageDown: active + 8, PageUp: active - 8 };
    if (e.key in moves) { e.preventDefault(); setActive(Math.max(0, Math.min(last, moves[e.key]))); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (items[active]) choose(items[active]); }
    else if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); hide(); }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeAhead(e.key);
  };

  const onButtonKey = (e) => {
    // Keys typed right after opening can land here before focus has moved to the list.
    if (open) { onListKey(e); return; }
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); show(); }
  };

  let i = -1;
  return (
    <>
      <button ref={btn} type="button" class={`select${open ? " open" : ""} ${className}`} disabled={disabled}
        aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => (open ? hide() : show())} onKeyDown={onButtonKey}>
        <span class={`select-value${selected ? "" : " placeholder"}`} style={selected?.style}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={15} class="select-chevron" aria-hidden="true" />
      </button>
      {open && pos && createPortal(
        <div ref={list} class="select-pop" role="listbox" tabIndex={-1} aria-label={label}
          aria-activedescendant={`${id}-${active}`} onKeyDown={onListKey} style={{ ...pos, position: "fixed" }}>
          {options.map((o) => {
            if ("group" in o) return <div class="select-group" role="presentation">{o.group}</div>;
            const n = ++i;
            const isSel = o.value === value;
            return (
              <div id={`${id}-${n}`} data-i={n} role="option" aria-selected={isSel}
                class={`select-opt${n === active ? " active" : ""}${isSel ? " selected" : ""}`}
                onMouseMove={() => n !== active && setActive(n)} onClick={() => choose(o)}>
                <span style={o.style}>{o.label}</span>
                {isSel && <Check size={15} aria-hidden="true" />}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
