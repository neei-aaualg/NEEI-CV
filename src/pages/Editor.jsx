// The CV editor: content and design on the left, live paginated preview on the right.
import { useEffect, useState } from "preact/hooks";
import { Eye, SquarePen } from "lucide-preact";
import { useDialogs } from "../components/Dialogs.jsx";
import { ContentPanel } from "../builder/content/ContentPanel.jsx";
import { CustomizePanel } from "../builder/customize/CustomizePanel.jsx";
import { editorPath, navigate } from "../lib/router.jsx";
import { useStore } from "../lib/store.jsx";
import { useResumeFonts } from "../lib/fonts.js";
import { exportJson } from "../lib/pdf.jsx";
import { usePdfExport } from "../lib/usePdfExport.js";
import { EditorTopBar } from "../components/editor/EditorTopBar.jsx";
import { Preview } from "../components/editor/Preview.jsx";
import { useHistory, useUndoShortcuts } from "../components/editor/useHistory.js";

const TAB_KEY = "neei-cv:tab";

function EditorView({ resume }) {
  const store = useStore();
  const dialogs = useDialogs();
  const pdf = usePdfExport();
  const history = useHistory(store, resume.id);
  const [tab, setTab] = useState(() => { try { return localStorage.getItem(TAB_KEY) || "content"; } catch { return "content"; } });
  const [view, setView] = useState("edit"); // phones show one side at a time: edit | preview
  useResumeFonts([resume.design]);
  useUndoShortcuts(history);

  useEffect(() => { try { localStorage.setItem(TAB_KEY, tab); } catch { /* ignore */ } }, [tab]);
  useEffect(() => { document.title = `${resume.name} · NEEI CV`; }, [resume.name]);

  const actions = {
    async rename() {
      const name = await dialogs.prompt({ title: "Mudar o nome do CV", label: "Nome do CV", value: resume.name });
      if (name) history.update((d) => { d.name = name; });
    },
    duplicate() {
      const copy = store.add({ ...structuredClone(resume), name: `${resume.name} (cópia)` });
      dialogs.toast("CV duplicado");
      navigate(editorPath(copy.id));
    },
    async remove() {
      const ok = await dialogs.confirm({ title: "Apagar este CV?", message: `“${resume.name}” vai ser apagado deste navegador. Esta ação não pode ser anulada.`, confirm: "Apagar", danger: true });
      if (!ok) return;
      navigate("/");
      store.remove(resume.id);
      dialogs.toast("CV apagado");
    },
    download: () => pdf.download(resume),
    print: () => pdf.print(resume),
    exportJson: () => exportJson(resume),
  };

  return (
    <div class={`editor view-${view}`}>
      <EditorTopBar resume={resume} tab={tab} onTab={(id) => { setTab(id); setView("edit"); }} history={history}
        saveError={store.saveError} busy={pdf.busyId === resume.id} actions={actions} />

      <main class="ed-work" id="main">
        <section class="ed-panel" aria-label={tab === "content" ? "Conteúdo" : "Personalizar"}>
          <div class="ed-scroll" key={tab}>
            {tab === "content"
              ? <ContentPanel resume={resume} update={history.update} />
              : <CustomizePanel resume={resume} update={history.update} />}
          </div>
        </section>
        <section class="ed-preview" aria-label="Pré-visualizar">
          <Preview resume={resume} />
        </section>
      </main>

      <div class="mobile-switch" role="tablist" aria-label="Pré-visualizar">
        <button type="button" role="tab" aria-selected={view === "edit"} class={view === "edit" ? "on" : ""} onClick={() => setView("edit")}><SquarePen size={16} />Editar</button>
        <button type="button" role="tab" aria-selected={view === "preview"} class={view === "preview" ? "on" : ""} onClick={() => setView("preview")}><Eye size={16} />Pré-visualizar</button>
      </div>
    </div>
  );
}

export function Editor({ id }) {
  const store = useStore();
  const dialogs = useDialogs();
  const resume = store.resumes.find((r) => r.id === id);

  useEffect(() => {
    if (resume) return;
    dialogs.toast("Esse CV não existe neste navegador.", "error");
    navigate("/", { replace: true });
  }, [!!resume]);

  if (!resume) return null;
  return <EditorView key={resume.id} resume={resume} />;
}
