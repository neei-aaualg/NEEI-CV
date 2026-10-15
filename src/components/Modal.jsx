// Accessible modal dialog: Escape and backdrop close it, focus moves in and is restored on close.
import { useEffect, useRef } from "preact/hooks";
import { X } from "lucide-preact";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ title, onClose, children, footer, size = "md", labelledBy }) {
  const ref = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const el = ref.current;
    (el.querySelector("[autofocus]") ?? el.querySelector(FOCUSABLE) ?? el).focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab") return;
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      el.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
      previous?.focus?.();
    };
  }, []);

  return (
    <div class="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} class={`modal modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy ?? "modal-title"} tabIndex={-1}>
        <div class="modal-head">
          <h2 id={labelledBy ?? "modal-title"}>{title}</h2>
          <button type="button" class="icon-btn" aria-label="Fechar" onClick={onClose}><X size={18} /></button>
        </div>
        <div class="modal-body">{children}</div>
        {footer && <div class="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
