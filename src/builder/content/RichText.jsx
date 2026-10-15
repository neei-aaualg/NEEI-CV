// Minimal rich text editor: bold, italic, underline, bullet/numbered lists, links.
import { useRef, useEffect, useState } from "preact/hooks";
import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-preact";
import { sanitizeHtml, isEmptyHtml, toHref } from "../html.js";
import { useDialogs } from "../../components/Dialogs.jsx";

const TOOLS = [
  ["bold", Bold, "Negrito (Ctrl+B)"],
  ["italic", Italic, "Itálico (Ctrl+I)"],
  ["underline", Underline, "Sublinhado (Ctrl+U)"],
  ["insertUnorderedList", List, "Lista com marcas"],
  ["insertOrderedList", ListOrdered, "Lista numerada"],
  ["link", Link2, "Inserir ligação"],
];

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function RichText({ value, onChange, placeholder, label }) {
  const dialogs = useDialogs();
  const ref = useRef(null);
  const lastEmitted = useRef(null);
  const [empty, setEmpty] = useState(isEmptyHtml(value));

  // Only overwrite the DOM when the value changed from outside (undo, switching entries),
  // so the caret is not reset while typing.
  useEffect(() => {
    if (ref.current && value !== lastEmitted.current) {
      ref.current.innerHTML = sanitizeHtml(value ?? "");
      lastEmitted.current = value;
      setEmpty(isEmptyHtml(value));
    }
  }, [value]);

  const emit = () => {
    let html = sanitizeHtml(ref.current.innerHTML);
    const isEmpty = isEmptyHtml(html);
    if (isEmpty) html = "";
    setEmpty(isEmpty);
    lastEmitted.current = html;
    onChange(html);
  };

  const addLink = async () => {
    const sel = window.getSelection();
    const range = sel.rangeCount && ref.current.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
    const url = await dialogs.prompt({ title: "Inserir ligação", label: "Endereço da ligação", value: "https://", confirm: "OK" });
    const href = url && toHref(url);
    if (!href) return;
    ref.current.focus();
    if (range) { sel.removeAllRanges(); sel.addRange(range); }
    if (!range || range.collapsed) document.execCommand("insertHTML", false, `<a href="${escapeHtml(href)}">${escapeHtml(url)}</a>`);
    else document.execCommand("createLink", false, href);
    emit();
  };

  const run = (cmd) => {
    if (cmd === "link") { addLink(); return; }
    ref.current.focus();
    document.execCommand(cmd, false, null);
    emit();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div class="rt">
      <div class="rt-toolbar" role="toolbar" aria-label="Formatação de texto">
        {TOOLS.map(([cmd, Icon, key]) => (
          <button type="button" class="rt-btn" title={key} aria-label={key}
            onMouseDown={(e) => e.preventDefault()} onClick={() => run(cmd)}><Icon size={15} /></button>
        ))}
      </div>
      <div ref={ref} class={`rt-area${empty ? " is-empty" : ""}`} contentEditable data-placeholder={placeholder}
        onInput={emit} onPaste={onPaste} role="textbox" aria-multiline="true" aria-label={label ?? placeholder} spellcheck />
    </div>
  );
}
