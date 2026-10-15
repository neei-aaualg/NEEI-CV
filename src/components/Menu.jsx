// Dropdown menu: click outside or Escape closes it; arrow keys move between items.
import { useEffect, useRef, useState } from "preact/hooks";

export function Menu({ button, children, align = "right", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); ref.current?.querySelector("[aria-haspopup]")?.focus(); return; }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? [])];
      const i = items.indexOf(document.activeElement);
      items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => menuRef.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true }));
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div class={`menu-wrap ${className}`} ref={ref}>
      {button({ toggle: () => setOpen((o) => !o), open })}
      {open && <div ref={menuRef} class={`menu menu-${align}`} role="menu" onClick={() => setOpen(false)}>{children}</div>}
    </div>
  );
}

export function MenuItem({ icon: Icon, children, danger, ...props }) {
  return (
    <button type="button" role="menuitem" class={`menu-item${danger ? " danger" : ""}`} {...props}>
      {Icon && <Icon size={16} aria-hidden="true" />}<span>{children}</span>
    </button>
  );
}
