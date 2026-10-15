// A live, scaled-down first page of a resume. Renders only once it scrolls near the viewport.
import { useEffect, useRef, useState } from "preact/hooks";
import { ResumePages, PAGE_SIZES } from "../builder/Resume.jsx";

const PX_PER_MM = 96 / 25.4;

export function PageThumb({ resume, design = resume.design, onLayout }) {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(0);
  const [visible, setVisible] = useState(false);
  const [w, h] = PAGE_SIZES[design.page] ?? PAGE_SIZES.A4;

  useEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(() => setZoom(el.clientWidth / (w * PX_PER_MM)));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: "300px" });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, [w]);

  return (
    <span ref={ref} class="thumb" style={{ aspectRatio: `${w} / ${h}` }}>
      {visible && zoom > 0 && (
        <span class="thumb-scale" style={{ zoom }}>
          <ResumePages resume={resume} design={design} maxPages={1} onLayout={onLayout} />
        </span>
      )}
    </span>
  );
}
