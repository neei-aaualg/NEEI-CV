import { useEffect, useRef, useState } from "preact/hooks";

/** Setting groups of the Customize tab, in page order (each is a card with id "cust-<group>"). */
export const GROUP_LABELS = {
  document: "Documento", templates: "Modelos", layout: "Disposição", fontsize: "Tamanho de letra", spacing: "Espaçamento",
  entries: "Entradas", headings: "Títulos", font: "Tipo de letra", colors: "Cores", header: "Cabeçalho", photo: "Foto",
  skills: "Competências", links: "Ligações", footer: "Rodapé",
};
export const GROUPS = Object.keys(GROUP_LABELS);

/** Scroll-spy for the side navigation: the group whose card is at the top of the panel is active. */
export function useActiveGroup(rootRef) {
  const [active, setActive] = useState(GROUPS[0]);
  const pausedUntil = useRef(0); // a nav click wins while its smooth scroll is running

  useEffect(() => {
    const root = rootRef.current;
    const scroller = root?.closest(".ed-scroll");
    if (!scroller) return;
    const update = () => {
      if (Date.now() < pausedUntil.current) return;
      const line = scroller.getBoundingClientRect().top + 72;
      let current = GROUPS[0];
      for (const id of GROUPS) {
        const el = root.querySelector(`#cust-${id}`);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) current = GROUPS[GROUPS.length - 1];
      setActive(current);
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, []);

  const pick = (id) => {
    setActive(id);
    pausedUntil.current = Date.now() + 900;
  };
  return [active, pick];
}
