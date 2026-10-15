// Content tab: personal details, then the sections (drag to reorder), then "Adicionar secção".
import { useRef, useState } from "preact/hooks";
import { Plus } from "lucide-preact";
import { SECTION_ORDER, SECTION_TYPES, newSection } from "../data.js";
import { SectionIcon } from "../icons.jsx";
import { Modal } from "../../components/Modal.jsx";
import { move, useSortable } from "./fields.jsx";
import { PersonalCard } from "./PersonalCard.jsx";
import { SectionCard } from "./SectionCard.jsx";

function AddSectionModal({ resume, onAdd, onClose }) {
  const used = new Set(resume.sections.map((s) => s.type));
  return (
    <Modal title="Adicionar secção" onClose={onClose} size="lg">
      <div class="type-grid">
        {SECTION_ORDER.map((type) => (
          <button type="button" class="type-tile" onClick={() => onAdd(type)}>
            <span class="type-icon"><SectionIcon type={type} size={22} /></span>
            <span>{SECTION_TYPES[type].name}</span>
            {used.has(type) && type !== "custom" && <span class="type-used">já adicionada</span>}
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function ContentPanel({ resume, update }) {
  const [openEntry, setOpenEntry] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [adding, setAdding] = useState(false);
  const listRef = useRef(null);
  useSortable(listRef, ".drag-section", (from, to) => update((d) => move(d.sections, from, to)), []);

  const add = (type) => {
    const s = newSection(type, resume.design.language);
    update((d) => { d.sections.push(s); });
    setAdding(false);
    if (s.entries[0]) setOpenEntry(s.entries[0].id);
    requestAnimationFrame(() => document.querySelector(`[data-id="${s.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <div class="content-panel">
      <PersonalCard resume={resume} update={update} />
      <div ref={listRef} class="sections">
        {resume.sections.map((s, i) => (
          <SectionCard key={s.id} section={s} index={i} total={resume.sections.length} update={update} design={resume.design}
            openEntry={openEntry} setOpenEntry={setOpenEntry}
            collapsed={!!collapsed[s.id]} toggleCollapsed={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))} />
        ))}
      </div>
      <button type="button" class="btn-add-section" onClick={() => setAdding(true)}><Plus size={19} />Adicionar secção</button>
      {adding && <AddSectionModal resume={resume} onAdd={add} onClose={() => setAdding(false)} />}
    </div>
  );
}
