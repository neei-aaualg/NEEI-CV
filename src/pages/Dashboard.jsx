// "Os meus CVs": every resume saved in this browser, plus the template gallery to start new ones.
import { useEffect, useRef, useState } from "preact/hooks";
import { Lock } from "lucide-preact";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import { useDialogs } from "../components/Dialogs.jsx";
import { blankResume, exampleResume, normalizeResume } from "../builder/data.js";
import { editorPath, navigate } from "../lib/router.jsx";
import { useStore } from "../lib/store.jsx";
import { useResumeFonts } from "../lib/fonts.js";
import { exportJson, readJsonFile } from "../lib/pdf.jsx";
import { usePdfExport } from "../lib/usePdfExport.js";
import { CreateModal } from "../components/dashboard/CreateModal.jsx";
import { CvList } from "../components/dashboard/CvList.jsx";
import { TemplateGallery, useTemplatePreviews } from "../components/dashboard/TemplateGallery.jsx";
import { ReturningHero, WelcomeHero } from "../components/dashboard/Hero.jsx";

export function Dashboard() {
  const store = useStore();
  const dialogs = useDialogs();
  const pdf = usePdfExport();
  const [creating, setCreating] = useState(false);
  const importRef = useRef(null);
  const previews = useTemplatePreviews();
  useResumeFonts([...store.resumes.map((r) => r.design), ...previews.map((p) => p.design)]);

  useEffect(() => { document.title = "Os meus CVs · NEEI CV"; }, []);

  const create = ({ name, start, lang, template }) => {
    const r = store.add(start === "example" ? exampleResume(name, lang, template) : blankResume(name, lang, template));
    setCreating(false);
    navigate(editorPath(r.id));
  };
  const nextName = () => `CV ${store.resumes.length + 1}`;
  // Gallery cards create the CV straight away: a template comes with the example text, the blank card with empty sections.
  const createFromTemplate = (template) => create({ name: nextName(), start: "example", lang: "pt", template });
  const createBlank = () => create({ name: nextName(), start: "blank", lang: "pt", template: "neei" });
  const startCreating = () => setCreating(true);
  const showTemplates = () => document.getElementById("modelos")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const importFile = async (file) => {
    setCreating(false);
    try {
      const resume = normalizeResume(await readJsonFile(file), file.name.replace(/\.json$/i, ""));
      if (!resume) throw new Error("não é um CV exportado do NEEI CV");
      store.add(resume);
      dialogs.toast("CV importado");
    } catch (err) {
      dialogs.toast(`Não foi possível importar o ficheiro: ${err.message}`, "error", 6000);
    }
  };

  const actionsFor = (r) => ({
    async rename() {
      const name = await dialogs.prompt({ title: "Mudar o nome do CV", label: "Nome do CV", value: r.name });
      if (name) { store.update(r.id, (d) => { d.name = name; }); dialogs.toast("Nome alterado"); }
    },
    duplicate() {
      store.add({ ...structuredClone(r), name: `${r.name} (cópia)` });
      dialogs.toast("CV duplicado");
    },
    download: () => pdf.download(r),
    exportJson: () => exportJson(r),
    async remove() {
      const ok = await dialogs.confirm({ title: "Apagar este CV?", message: `“${r.name}” vai ser apagado deste navegador. Esta ação não pode ser anulada.`, confirm: "Apagar", danger: true });
      if (ok) { store.remove(r.id); dialogs.toast("CV apagado"); }
    },
  });

  const hasCvs = store.resumes.length > 0;
  const gallery = (title) => <TemplateGallery previews={previews} title={title} onPick={createFromTemplate} onBlank={createBlank} onImport={() => importRef.current.click()} />;

  return (
    <div class="page">
      <SiteHeader />
      <main class="dash container" id="main">
        {/* New visitors get an introduction and the templates; returning ones see their CVs first. */}
        {hasCvs ? <ReturningHero /> : <WelcomeHero previews={previews} onStart={showTemplates} />}
        {hasCvs && <CvList resumes={store.resumes} busyId={pdf.busyId} actionsFor={actionsFor} onNew={startCreating} />}
        {gallery(hasCvs ? "Começar um novo CV" : "Escolhe um modelo")}

        <p class="privacy-note">
          <Lock size={15} aria-hidden="true" />
          <span>
            <strong>Os teus CVs ficam só neste navegador.</strong> Não há contas nem registos.
            Para continuares noutro computador, exporta o CV em JSON (menu ⋮ do cartão) e importa-o lá.
          </span>
        </p>
        {store.saveError && <p class="save-error-banner" role="alert">Não foi possível guardar: o armazenamento do navegador está cheio ou bloqueado.</p>}
      </main>
      <SiteFooter />
      <input ref={importRef} type="file" accept="application/json,.json" hidden
        onChange={(e) => { const f = e.currentTarget.files[0]; e.currentTarget.value = ""; if (f) importFile(f); }} />
      {creating && <CreateModal count={store.resumes.length} previews={previews}
        onClose={() => setCreating(false)} onCreate={create} onImport={importFile} />}
    </div>
  );
}
