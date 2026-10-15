// Form for one entry (a job, a degree, a skill…). Which fields show depends on the section type.
import { Trash2 } from "lucide-preact";
import { SECTION_TYPES } from "../data.js";
import { Field, TextInput } from "./fields.jsx";
import { MonthPicker } from "./MonthPicker.jsx";
import { RichText } from "./RichText.jsx";

function LevelPicker({ value, onChange }) {
  return (
    <div class="level-picker" role="radiogroup" aria-label="Nível">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" role="radio" aria-checked={value === n} class={`lvl${n <= value ? " on" : ""}`}
          title={`Nível ${n}`} aria-label={`Nível ${n}`} onClick={() => onChange(value === n ? 0 : n)} />
      ))}
      <span class="hint">{value ? `${value}/5` : "Sem nível"}</span>
    </div>
  );
}

export function EntryEditor({ section, entry, update, onClose }) {
  const cfg = SECTION_TYPES[section.type];
  // Entries are found by id, so edits stay correct after the list is reordered.
  const set = (key, coalesce = true) => (v) => update((d) => {
    const e = d.sections.find((s) => s.id === section.id)?.entries.find((x) => x.id === entry.id);
    if (e) e[key] = v;
  }, coalesce ? `entry.${entry.id}.${key}` : null);

  const remove = () => {
    update((d) => {
      const s = d.sections.find((x) => x.id === section.id);
      if (s) s.entries = s.entries.filter((x) => x.id !== entry.id);
    });
    onClose();
  };

  return (
    <div class="entry-editor">
      <div class="grid2">
        <Field label={cfg.title} wide={!cfg.subtitle}><TextInput value={entry.title} onInput={set("title")} /></Field>
        {cfg.subtitle && <Field label={cfg.subtitle}><TextInput value={entry.subtitle} onInput={set("subtitle")} /></Field>}
        {cfg.dates === "range" && <>
          <div class="fld"><span class="fld-label">Data de início</span><MonthPicker value={entry.start} onChange={set("start", false)} label="Data de início" /></div>
          <div class="fld">
            <span class="fld-label">Data de fim</span>
            <MonthPicker value={entry.current ? "" : entry.end} onChange={set("end", false)} disabled={entry.current} label="Data de fim" />
            <label class="check check-sm"><input type="checkbox" checked={entry.current} onChange={(e) => set("current", false)(e.currentTarget.checked)} /> Atual</label>
          </div>
        </>}
        {cfg.dates === "single" && <div class="fld"><span class="fld-label">Data</span><MonthPicker value={entry.start} onChange={set("start", false)} label="Data" /></div>}
        {cfg.location && <Field label={cfg.location}><TextInput value={entry.location} onInput={set("location")} /></Field>}
        {cfg.link && <Field label="Ligação" wide={!cfg.location || cfg.dates === "single"}><TextInput value={entry.link} onInput={set("link")} placeholder="https://" /></Field>}
        {cfg.level && <Field label="Nível" wide><LevelPicker value={entry.level} onChange={set("level", false)} /></Field>}
        {cfg.description && (
          <div class="fld fld-wide">
            <span class="fld-label">Descrição</span>
            <RichText value={entry.description} onChange={set("description")} placeholder="O que fizeste? Usa tópicos para destacar resultados concretos." label="Descrição" />
          </div>
        )}
      </div>
      <div class="entry-editor-foot">
        <button type="button" class="btn btn-ghost danger btn-sm" onClick={remove}><Trash2 size={15} />Apagar entrada</button>
        <button type="button" class="btn btn-primary btn-sm" onClick={onClose}>Concluído</button>
      </div>
    </div>
  );
}
