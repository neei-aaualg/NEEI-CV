// Live, paginated preview with page count and zoom (fit to width by default).
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-preact";
import { ResumePages, PAGE_SIZES } from "../../builder/Resume.jsx";

const PX_PER_MM = 96 / 25.4;

export function Preview({ resume }) {
  const wrap = useRef(null);
  const [fit, setFit] = useState(0.6);
  const [zoom, setZoom] = useState(null); // null = fit to width
  const [pages, setPages] = useState(1);
  const [w] = PAGE_SIZES[resume.design.page] ?? PAGE_SIZES.A4;

  useLayoutEffect(() => {
    const el = wrap.current;
    const ro = new ResizeObserver(() => setFit(Math.max(0.2, Math.min(1.3, (el.clientWidth - 48) / (w * PX_PER_MM)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  const scale = zoom ?? fit;
  const stepZoom = (dir) => setZoom(Math.max(0.3, Math.min(2, Math.round((scale + dir * 0.1) * 10) / 10)));

  return (
    <div class="preview" ref={wrap}>
      <div class="preview-scale" style={{ zoom: scale }}>
        <ResumePages resume={resume} onLayout={(l) => setPages(l.pageCount)} />
      </div>
      <div class="preview-bar">
        <span class="page-count">{pages === 1 ? `1 página` : `${pages} páginas`}</span>
        <span class="preview-zoom">
          <button type="button" class="pz-btn" onClick={() => stepZoom(-1)} aria-label="Diminuir" title="Diminuir"><ZoomOut size={15} /></button>
          <span class="pz-val">{Math.round(scale * 100)}%</span>
          <button type="button" class="pz-btn" onClick={() => stepZoom(1)} aria-label="Aumentar" title="Aumentar"><ZoomIn size={15} /></button>
          <button type="button" class={`pz-btn${zoom === null ? " on" : ""}`} onClick={() => setZoom(null)} aria-label="Ajustar à largura" title="Ajustar à largura"><Maximize2 size={14} /></button>
        </span>
      </div>
    </div>
  );
}
