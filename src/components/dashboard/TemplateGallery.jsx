// Template previews: the gallery on the CV list and the picker in the create dialog.
import { useMemo } from "preact/hooks";
import { Check, Plus, Upload } from "lucide-preact";
import { PageThumb } from "../PageThumb.jsx";
import { applyTemplate, DEFAULT_DESIGN, exampleResume, TEMPLATES } from "../../builder/data.js";

/** One example resume rendered in every template, for previews. */
export function useTemplatePreviews() {
  return useMemo(() => {
    const sample = exampleResume("", "pt");
    return TEMPLATES.map((tpl) => ({ id: tpl.id, name: tpl.name, description: tpl.description, sample, design: applyTemplate(DEFAULT_DESIGN, tpl.id) }));
  }, []);
}

export function TemplateGallery({ previews, title, onPick, onBlank, onImport }) {
  return (
    <section class="tpl-gallery" id="modelos" aria-labelledby="tpl-gallery-title">
      <div class="section-heading section-heading-row">
        <div>
          <h2 id="tpl-gallery-title">{title}</h2>
          <p>Cada modelo traz texto de exemplo para substituíres. Podes trocar de modelo quando quiseres, sem perder o que escreveste.</p>
        </div>
        <button type="button" class="btn btn-secondary" onClick={onImport} title="Abrir um CV que exportaste antes"><Upload size={16} />Importar JSON</button>
      </div>
      <div class="tpl-strip">
        <button type="button" class="tpl-card tpl-card-blank" onClick={onBlank} aria-label="Criar um CV em branco">
          <span class="tpl-card-thumb tpl-blank-thumb">
            <span class="tpl-blank-icon" aria-hidden="true"><Plus size={26} /></span>
          </span>
          <span class="tpl-card-name">CV em branco</span>
          <span class="tpl-card-desc">Secções vazias, para começares do zero</span>
        </button>
        {previews.map(({ id, name, description, design, sample }) => {
          return (
            <button type="button" class="tpl-card" onClick={() => onPick(id)} aria-label={`Criar um CV com o modelo ${name}`}>
              <span class="tpl-card-thumb" aria-hidden="true">
                <PageThumb resume={sample} design={design} />
                <span class="tpl-card-overlay" aria-hidden="true"><span class="tpl-card-use"><Plus size={15} />Usar modelo</span></span>
              </span>
              <span class="tpl-card-name">{name}</span>
              <span class="tpl-card-desc">{description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** The single choice in the "Novo CV" dialog: an empty CV or one of the templates (with example text). */
export function StartPicker({ previews, value, onChange }) {
  const tile = (id, name, frame) => (
    <button type="button" role="radio" aria-checked={value === id} aria-label={name} class={`tpl${value === id ? " on" : ""}`} onClick={() => onChange(id)}>
      <span class="tpl-frame" aria-hidden="true">{frame}{value === id && <span class="tpl-check" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>}</span>
      <span class="tpl-name">{name}</span>
    </button>
  );
  return (
    <div class="tpl-picker" role="radiogroup" aria-label="Começar com">
      {tile("blank", "CV em branco", <span class="tpl-frame-blank"><Plus size={22} aria-hidden="true" /></span>)}
      {previews.map(({ id, name, design, sample }) => tile(id, name, <PageThumb resume={sample} design={design} />))}
    </div>
  );
}
