// Editor header: back to the list, CV name and save state, Content/Customize tabs, undo/redo, PDF and more.
import {
  ArrowLeft, CircleCheck, Copy, Download, EllipsisVertical, FileText, LoaderCircle, Palette, Pencil, Printer, Redo2,
  Trash2, TriangleAlert, Undo2,
} from "lucide-preact";
import { Brand, ThemeToggle } from "../Chrome.jsx";
import { Menu, MenuItem } from "../Menu.jsx";
import { Link } from "../../lib/router.jsx";

const TABS = [["content", FileText, "Conteúdo"], ["customize", Palette, "Personalizar"]];

/** `actions`: rename, duplicate, remove, download, print, exportJson. */
export function EditorTopBar({ resume, tab, onTab, history, saveError, busy, actions }) {
  return (
    <header class="ed-top">
      <div class="ed-top-left">
        <Link href="/" class="round-btn" title="Os meus CVs" aria-label="Os meus CVs"><ArrowLeft size={17} /></Link>
        <span class="ed-brand"><Brand compact /></span>
        <div class="ed-title">
          <button type="button" class="ed-name" onClick={actions.rename} title="Mudar o nome do CV">
            <span>{resume.name}</span><Pencil size={13} aria-hidden="true" />
          </button>
          {saveError
            ? <span class="save-state error" title="O armazenamento do navegador está cheio. Exporta o CV em JSON para guardares uma cópia." role="alert"><TriangleAlert size={13} />Não guardado</span>
            : <span class="save-state"><CircleCheck size={13} />Guardado</span>}
        </div>
      </div>

      <nav class="ed-tabs" role="tablist" aria-label="Conteúdo">
        {TABS.map(([id, Icon, key]) => (
          <button type="button" role="tab" aria-selected={tab === id} class={`ed-tab${tab === id ? " on" : ""}`} onClick={() => onTab(id)}>
            <Icon size={16} aria-hidden="true" /><span>{key}</span>
          </button>
        ))}
      </nav>

      <div class="ed-top-right">
        <span class="ed-history">
          <button type="button" class="icon-btn" title="Anular (Ctrl+Z)" aria-label="Anular (Ctrl+Z)" disabled={!history.canUndo} onClick={history.undo}><Undo2 size={17} /></button>
          <button type="button" class="icon-btn" title="Refazer (Ctrl+Y)" aria-label="Refazer (Ctrl+Y)" disabled={!history.canRedo} onClick={history.redo}><Redo2 size={17} /></button>
        </span>
        <span class="ed-toggles"><ThemeToggle /></span>
        <button type="button" class="btn btn-primary btn-download" onClick={actions.download} disabled={busy}>
          {busy ? <LoaderCircle size={16} class="spin" /> : <Download size={16} />}
          <span class="hide-sm">{busy ? "A preparar…" : "Descarregar PDF"}</span>
          <span class="show-sm">PDF</span>
        </button>
        <Menu button={({ toggle, open }) => (
          <button type="button" class="icon-btn" aria-label="Mais opções" aria-haspopup="menu" aria-expanded={open} onClick={toggle}><EllipsisVertical size={18} /></button>
        )}>
          <MenuItem icon={Printer} onClick={actions.print}>Imprimir</MenuItem>
          <MenuItem icon={FileText} onClick={actions.exportJson}>Exportar JSON</MenuItem>
          <hr />
          <MenuItem icon={Pencil} onClick={actions.rename}>Mudar o nome</MenuItem>
          <MenuItem icon={Copy} onClick={actions.duplicate}>Duplicar</MenuItem>
          <MenuItem icon={Trash2} danger onClick={actions.remove}>Apagar</MenuItem>
          <hr class="show-sm-block" />
          <div class="menu-toggles show-sm-flex"><ThemeToggle /></div>
        </Menu>
      </div>
    </header>
  );
}
