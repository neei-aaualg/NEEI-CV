// One section in the Content tab: header (rename, hide, move, delete, collapse) and its entries or text.
import { useRef, useState } from "preact/hooks";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Ellipsis, Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-preact";
import { SECTION_TYPES, newEntry, label, dateRange } from "../data.js";
import { SectionIcon } from "../icons.jsx";
import { Menu, MenuItem } from "../../components/Menu.jsx";
import { useDialogs } from "../../components/Dialogs.jsx";
import { move, useSortable } from "./fields.jsx";
import { EntryEditor } from "./EntryEditor.jsx";
import { RichText } from "./RichText.jsx";

function SectionHeader({ section, heading, index, total, collapsed, toggleCollapsed, update, at }) {
  const dialogs = useDialogs();
  const [editingHeading, setEditingHeading] = useState(false);
  const shift = (by) => update((d) => move(d.sections, index, index + by));
  const remove = async () => {
    const ok = await dialogs.confirm({ title: "Apagar secção?", message: `A secção “${heading}” e todo o seu conteúdo vão ser apagados. Podes anular com Ctrl+Z.`, confirm: "Apagar", danger: true });
    if (ok) update((d) => { d.sections = d.sections.filter((s) => s.id !== section.id); });
  };
  const visibility = section.hidden ? "Mostrar no CV" : "Esconder do CV";

  return (
    <div class="section-head">
      <span class="drag drag-section" title="Arrastar para reordenar" aria-hidden="true"><GripVertical size={18} /></span>
      <span class="section-icon"><SectionIcon type={section.type} /></span>
      {editingHeading ? (
        <input class="inp heading-input" value={section.heading} autoFocus aria-label="Título da secção" maxLength={80}
          onInput={(e) => update((d) => { at(d).heading = e.currentTarget.value; }, `heading.${section.id}`)}
          onBlur={() => setEditingHeading(false)} onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setEditingHeading(false)} />
      ) : (
        <button type="button" class="section-title" onClick={toggleCollapsed} aria-expanded={!collapsed}>
          <h3>{heading}</h3>
          {section.hidden && <span class="badge">Escondida</span>}
        </button>
      )}
      <span class="spacer" />
      <button type="button" class="icon-btn" title={visibility} aria-label={visibility}
        onClick={() => update((d) => { at(d).hidden = !section.hidden; })}>{section.hidden ? <EyeOff size={17} /> : <Eye size={17} />}</button>
      <Menu button={({ toggle, open }) => (
        <button type="button" class="icon-btn" aria-label={`${heading}: Mais opções`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}><Ellipsis size={18} /></button>
      )}>
        <MenuItem icon={Pencil} onClick={() => setEditingHeading(true)}>Editar título</MenuItem>
        <MenuItem icon={ArrowUp} disabled={index === 0} onClick={() => shift(-1)}>Mover para cima</MenuItem>
        <MenuItem icon={ArrowDown} disabled={index === total - 1} onClick={() => shift(1)}>Mover para baixo</MenuItem>
        <hr />
        <MenuItem icon={Trash2} danger onClick={remove}>Apagar secção</MenuItem>
      </Menu>
      <button type="button" class="icon-btn" aria-label={collapsed ? "Expandir" : "Recolher"} onClick={toggleCollapsed}>
        {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>
    </div>
  );
}

function EntryList({ section, design, update, at, openEntry, setOpenEntry }) {
  const cfg = SECTION_TYPES[section.type];
  const listRef = useRef(null);
  useSortable(listRef, ".drag-entry", (from, to) => update((d) => move(at(d).entries, from, to)), [section.id]);

  const addEntry = () => {
    const ne = newEntry();
    update((d) => { at(d).entries.push(ne); });
    setOpenEntry(ne.id);
  };

  return (
    <>
      <div ref={listRef} class="entries">
        {section.entries.map((e) => {
          const main = [e.title, e.subtitle].filter(Boolean).join(", ") || "(Sem título)";
          const extra = cfg.dates ? dateRange(e, design) : "";
          const isOpen = openEntry === e.id;
          const visibility = e.hidden ? "Mostrar no CV" : "Esconder do CV";
          return (
            <div class={`entry-row-wrap${isOpen ? " open" : ""}`} key={e.id}>
              <div class={`entry-row${e.hidden ? " is-hidden" : ""}`}>
                <span class="drag drag-entry" title="Arrastar para reordenar" aria-hidden="true"><GripVertical size={16} /></span>
                <button type="button" class="entry-label" aria-expanded={isOpen} onClick={() => setOpenEntry(isOpen ? null : e.id)}>
                  <strong>{main}</strong>{extra && <span class="muted"> · {extra}</span>}
                </button>
                <button type="button" class="icon-btn" title={visibility} aria-label={visibility}
                  onClick={() => update((d) => { const x = at(d).entries.find((y) => y.id === e.id); if (x) x.hidden = !e.hidden; })}>
                  {e.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isOpen && <EntryEditor section={section} entry={e} update={update} onClose={() => setOpenEntry(null)} />}
            </div>
          );
        })}
      </div>
      <div class="section-foot">
        <button type="button" class="btn btn-secondary btn-sm" onClick={addEntry}><Plus size={15} />Adicionar entrada</button>
      </div>
    </>
  );
}

export function SectionCard({ section, index, total, update, design, openEntry, setOpenEntry, collapsed, toggleCollapsed }) {
  const cfg = SECTION_TYPES[section.type];
  const at = (d) => d.sections.find((s) => s.id === section.id);
  const heading = section.heading || label(design.language, section.type);

  return (
    <div class={`card section-card${section.hidden ? " is-hidden" : ""}`} data-id={section.id}>
      <SectionHeader section={section} heading={heading} index={index} total={total}
        collapsed={collapsed} toggleCollapsed={toggleCollapsed} update={update} at={at} />
      {!collapsed && (cfg.text ? (
        <div class="section-body">
          <RichText value={section.text} label={heading}
            placeholder={section.type === "summary" ? "Uma breve apresentação: quem és, no que és bom e o que procuras." : "Declaro que as informações acima são verdadeiras."}
            onChange={(v) => update((d) => { at(d).text = v; }, `text.${section.id}`)} />
        </div>
      ) : (
        <EntryList section={section} design={design} update={update} at={at} openEntry={openEntry} setOpenEntry={setOpenEntry} />
      ))}
    </div>
  );
}
