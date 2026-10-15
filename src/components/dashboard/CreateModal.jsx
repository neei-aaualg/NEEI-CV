// "Novo CV" dialog: name, one choice of how to start (blank or a template with example text) and CV language.
// Importing a JSON file is a separate action in the footer.
import { useRef, useState } from "preact/hooks";
import { Upload } from "lucide-preact";
import { Modal } from "../Modal.jsx";
import { Select } from "../Select.jsx";
import { LANGUAGES } from "../../builder/data.js";
import { StartPicker } from "./TemplateGallery.jsx";

export function CreateModal({ count, previews, onClose, onCreate, onImport }) {
  const [name, setName] = useState(`CV ${count + 1}`);
  const [choice, setChoice] = useState("blank"); // "blank" or a template id
  const [cvLang, setCvLang] = useState("pt");
  const fileRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const blank = choice === "blank";
    onCreate({
      name: name.trim() || `CV ${count + 1}`,
      start: blank ? "blank" : "example",
      template: blank ? "neei" : choice,
      lang: cvLang,
    });
  };

  return (
    <Modal title="Criar novo CV" onClose={onClose} size="lg">
      <form onSubmit={submit} class="create-form">
        <label class="fld">
          <span class="fld-label">Nome do CV</span>
          <input class="inp" value={name} maxLength={120} placeholder="Ex.: CV Estágio de Verão" autofocus
            onInput={(e) => setName(e.currentTarget.value)} onFocus={(e) => e.currentTarget.select()} />
        </label>
        <div class="fld">
          <span class="fld-label">Começar com</span>
          <StartPicker previews={previews} value={choice} onChange={setChoice} />
          <span class="hint">{choice === "blank" ? "Secções essenciais vazias, prontas a preencher, no modelo NEEI." : "O modelo já vem com texto de exemplo para substituíres. Podes mudar de modelo depois, em Personalizar."}</span>
        </div>
        <label class="fld">
          <span class="fld-label">Idioma do CV</span>
          <Select value={cvLang} onChange={setCvLang} label="Idioma do CV"
            options={Object.entries(LANGUAGES).map(([value, label]) => ({ value, label }))} />
          <span class="hint">Idioma dos títulos e datas impressos no CV. Podes mudá-lo depois.</span>
        </label>
        <div class="modal-foot modal-foot-inline">
          <button type="button" class="btn btn-ghost" onClick={() => fileRef.current.click()}><Upload size={16} />Importar JSON</button>
          <span class="spacer" />
          <button type="button" class="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" class="btn btn-primary">Criar CV</button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e) => { const f = e.currentTarget.files[0]; e.currentTarget.value = ""; if (f) onImport(f); }} />
      </form>
    </Modal>
  );
}
