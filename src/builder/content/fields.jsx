// Small form pieces shared by the content editors, plus drag-to-reorder for lists.
import { useEffect, useRef } from "preact/hooks";
import Sortable from "sortablejs";

export function Field({ label, children, wide }) {
  return <label class={`fld${wide ? " fld-wide" : ""}`}><span class="fld-label">{label}</span>{children}</label>;
}

export function TextInput({ value, onInput, placeholder, type = "text", autoComplete }) {
  return <input class="inp" type={type} value={value ?? ""} placeholder={placeholder} autoComplete={autoComplete ?? "off"} onInput={(e) => onInput(e.currentTarget.value)} />;
}

/** Makes a list sortable by its drag handle; Preact keeps owning the DOM. */
export function useSortable(ref, handle, onMove, deps = []) {
  const latest = useRef(onMove);
  latest.current = onMove;
  useEffect(() => {
    if (!ref.current) return;
    const sortable = Sortable.create(ref.current, {
      handle,
      animation: 150,
      ghostClass: "sort-ghost",
      onEnd(evt) {
        const { oldIndex, newIndex, item, from } = evt;
        if (oldIndex === newIndex) return;
        // Put the node back where Preact expects it, then reorder through state.
        from.removeChild(item);
        from.insertBefore(item, from.children[oldIndex] ?? null);
        latest.current(oldIndex, newIndex);
      },
    });
    return () => sortable.destroy();
  }, deps);
}

/** Moves list[from] to position `to` in place; out-of-range moves are ignored. */
export function move(list, from, to) {
  if (to < 0 || to >= list.length) return;
  const [x] = list.splice(from, 1);
  list.splice(to, 0, x);
}
