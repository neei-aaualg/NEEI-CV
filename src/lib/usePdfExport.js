// PDF download with a friendly fallback to the print dialog when the PDF service is unavailable.
import { useState } from "preact/hooks";
import { downloadPdf, printHtml, printResume } from "./pdf.jsx";
import { useDialogs } from "../components/Dialogs.jsx";

export function usePdfExport() {
  const dialogs = useDialogs();
  const [busyId, setBusyId] = useState(null);

  const download = async (resume) => {
    if (busyId) return;
    setBusyId(resume.id);
    let failure = null;
    try {
      await downloadPdf(resume);
      dialogs.toast("PDF descarregado");
    } catch (err) {
      failure = err;
    } finally {
      setBusyId(null);
    }
    if (!failure) return;
    console.warn("[pdf]", failure);
    const ok = await dialogs.confirm({
      title: "PDF indisponível",
      message: `Não foi possível gerar o PDF (${failure.message}). Podes usar a janela de impressão do navegador e escolher “Guardar como PDF”.`,
      confirm: "Abrir impressão",
    });
    if (ok) failure.html ? printHtml(failure.html) : printResume(resume);
  };

  const print = async (resume) => {
    try {
      await printResume(resume);
    } catch (err) {
      dialogs.toast(String(err.message ?? err), "error");
    }
  };

  return { busyId, download, print };
}
