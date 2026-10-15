// "Os teus CVs": search, sort and the grid of CV cards.
import { useEffect, useMemo, useState } from "preact/hooks";
import { Clock, Copy, Download, EllipsisVertical, FileText, LoaderCircle, Pencil, Plus, Search, SquarePen, Trash2 } from "lucide-preact";
import { Menu, MenuItem } from "../Menu.jsx";
import { PageThumb } from "../PageThumb.jsx";
import { Select } from "../Select.jsx";
import { editorPath, Link, navigate } from "../../lib/router.jsx";
import { timeAgo, useNow } from "./time.js";

const SORT_KEY = "neei-cv:sort";
const SORTS = {
  recent: (a, b) => b.updatedAt - a.updatedAt,
  created: (a, b) => b.createdAt - a.createdAt,
  name: (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" }),
};

function CvCard({ resume, now, busy, actions }) {
  const [pages, setPages] = useState(null);
  const href = editorPath(resume.id);
  return (
    <article class="cv-card">
      <Link href={href} class="cv-card-thumb" aria-label={`Abrir: ${resume.name}`}>
        <PageThumb resume={resume} onLayout={(l) => setPages(l.pageCount)} />
        {pages && <span class="cv-card-pages">{pages === 1 ? `1 página` : `${pages} páginas`}</span>}
        <span class="cv-card-overlay" aria-hidden="true"><span class="cv-card-open"><SquarePen size={16} />Editar</span></span>
      </Link>
      <div class="cv-card-body">
        <div class="cv-card-text">
          <Link href={href} class="cv-card-name" title={resume.name}>{resume.name}</Link>
          <span class="cv-card-meta">
            <Clock size={13} aria-hidden="true" />
            <span>{`Editado ${timeAgo(resume.updatedAt, now)}`}</span>
          </span>
        </div>
        {busy ? <span class="icon-btn" aria-busy="true"><LoaderCircle size={18} class="spin" /></span> : (
          <Menu button={({ toggle, open }) => (
            <button type="button" class="icon-btn" aria-label={`Ações para ${resume.name}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
              <EllipsisVertical size={18} />
            </button>
          )}>
            <MenuItem icon={SquarePen} onClick={() => navigate(href)}>Abrir</MenuItem>
            <MenuItem icon={Pencil} onClick={actions.rename}>Mudar o nome</MenuItem>
            <MenuItem icon={Copy} onClick={actions.duplicate}>Duplicar</MenuItem>
            <hr />
            <MenuItem icon={Download} onClick={actions.download}>Descarregar PDF</MenuItem>
            <MenuItem icon={FileText} onClick={actions.exportJson}>Exportar JSON</MenuItem>
            <hr />
            <MenuItem icon={Trash2} danger onClick={actions.remove}>Apagar</MenuItem>
          </Menu>
        )}
      </div>
    </article>
  );
}

/** `actionsFor(resume)` returns that card's menu handlers; `busyId` is the CV whose PDF is being made. */
export function CvList({ resumes, busyId, actionsFor, onNew }) {
  const now = useNow();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(() => { try { return localStorage.getItem(SORT_KEY) || "recent"; } catch { return "recent"; } });

  useEffect(() => { try { localStorage.setItem(SORT_KEY, sort); } catch { /* ignore */ } }, [sort]);

  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const found = resumes.filter((r) => !q || `${r.name} ${r.personal.name} ${r.personal.title}`.toLocaleLowerCase().includes(q));
    return found.sort(SORTS[sort] ?? (() => 0));
  }, [resumes, query, sort]);

  return (
    <section class="dash-list" aria-labelledby="your-cvs">
      <div class="dash-toolbar">
        <h2 id="your-cvs" class="dash-count">Os teus CVs <span>({resumes.length})</span></h2>
        <span class="spacer" />
        <label class="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" value={query} placeholder="Pesquisar CVs…" aria-label="Pesquisar CVs…" onInput={(e) => setQuery(e.currentTarget.value)} />
        </label>
        <Select className="sort-select" value={sort} onChange={setSort} label="Ordenar"
          options={[{ value: "recent", label: "Editados recentemente" }, { value: "created", label: "Mais recentes" }, { value: "name", label: "Nome (A–Z)" }]} />
      </div>
      <div class="cv-grid">
        <button type="button" class="cv-card cv-card-new" onClick={onNew}>
          <span class="cv-new-icon"><Plus size={28} aria-hidden="true" /></span>
          <span class="cv-new-title">Novo CV</span>
          <span class="cv-new-desc">Em branco ou a partir de um modelo, com o nome e o idioma que quiseres</span>
        </button>
        {list.map((r) => <CvCard key={r.id} resume={r} now={now} busy={busyId === r.id} actions={actionsFor(r)} />)}
      </div>
      {list.length === 0 && <p class="no-results">{`Nenhum CV corresponde a “${query}”.`}</p>}
    </section>
  );
}
