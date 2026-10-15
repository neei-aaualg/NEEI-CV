// Template picker in the Customize tab: a live thumbnail of this CV in every template.
import { useMemo } from "preact/hooks";
import { TEMPLATES, applyTemplate } from "../data.js";
import { PageThumb } from "../../components/PageThumb.jsx";
import { useResumeFonts } from "../../lib/fonts.js";

export function TemplateThumbs({ resume, design, onPick }) {
  const key = JSON.stringify([design.language, design.dateFormat, design.page]);
  const thumbs = useMemo(() => TEMPLATES.map((tpl) => ({ tpl, d: applyTemplate(design, tpl.id) })), [key]);
  useResumeFonts(thumbs.map((x) => x.d));
  return (
    <div class="tpl-grid">
      {thumbs.map(({ tpl, d }) => {
        const name = tpl.name;
        return (
          <button type="button" class={`tpl${design.template === tpl.id ? " on" : ""}`} onClick={() => onPick(tpl.id)} aria-label={`Aplicar o modelo ${name}`} aria-pressed={design.template === tpl.id}>
            <span class="tpl-frame" aria-hidden="true"><PageThumb resume={resume} design={d} /></span>
            <span class="tpl-name">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
