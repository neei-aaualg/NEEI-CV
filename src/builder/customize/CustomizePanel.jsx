// Customize tab: every design setting, grouped like the content of a style guide.
import { useRef } from "preact/hooks";
import { Languages, Plus } from "lucide-preact";
import { LANGUAGES, DATE_FORMATS, FONTS, ACCENTS, applyTemplate, fontStack, formatDate, label } from "../data.js";
import { SectionIcon } from "../icons.jsx";
import { useDialogs } from "../../components/Dialogs.jsx";
import { Select } from "../../components/Select.jsx";
import { loadFontPreviews } from "../../lib/fonts.js";
import { bars, Card, Check, Range, Seg, Sub } from "./controls.jsx";
import { TemplateThumbs } from "./TemplateThumbs.jsx";
import { GROUP_LABELS, GROUPS, useActiveGroup } from "./useActiveGroup.js";

const ACCENT_TARGETS = {"name":"Nome","title":"Título profissional","headings":"Títulos","headingLine":"Linhas dos títulos","headerIcons":"Ícones do cabeçalho","dates":"Datas","entryTitle":"Título das entradas","entrySubtitle":"Subtítulo das entradas","linkIcons":"Ícones de ligação","levels":"Níveis"};

const ALL_LABELS = (type) => Object.keys(LANGUAGES).map((l) => label(l, type));

export function CustomizePanel({ resume, update }) {
  const dialogs = useDialogs();
  const d = resume.design;
  const set = (key, coalesce = false) => (v) => update((r) => { r.design[key] = v; }, coalesce ? `design.${key}` : null);
  const setAcc = (key) => (v) => update((r) => { r.design.accentOn[key] = v; });
  const twoCols = d.columns === "two";
  // Each font is listed in its own typeface.
  const fontOption = (f) => ({ value: f, label: f, style: { fontFamily: fontStack(f) } });
  const fontOptions = [
    { group: "Sem serifa" }, ...Object.keys(FONTS).filter((f) => FONTS[f] === "sans").map(fontOption),
    { group: "Com serifa" }, ...Object.keys(FONTS).filter((f) => FONTS[f] === "serif").map(fontOption),
  ];
  const rootRef = useRef(null);
  const [activeGroup, pickGroup] = useActiveGroup(rootRef);

  // Headings still showing a default label (in any language) follow the CV language; custom ones are kept.
  const untranslated = resume.sections.filter((s) => ALL_LABELS(s.type).includes(s.heading) && s.heading !== label(d.language, s.type));
  const translateHeadings = () => {
    update((r) => {
      for (const s of r.sections) if (ALL_LABELS(s.type).includes(s.heading)) s.heading = label(r.design.language, s.type);
    });
    dialogs.toast("Títulos das secções traduzidos");
  };

  const jump = (id) => {
    pickGroup(id);
    document.getElementById(`cust-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div class="customize" ref={rootRef}>
      <nav class="cust-nav" aria-label="Personalizar">
        {GROUPS.map((id) => (
          <button type="button" class={activeGroup === id ? "on" : ""} aria-current={activeGroup === id ? "true" : undefined} onClick={() => jump(id)}>
            {GROUP_LABELS[id]}
          </button>
        ))}
      </nav>
      <div class="cust-cards">
        <Card id="document" title="Documento">
          <div class="grid3">
            <label class="fld"><span class="fld-label">Idioma do CV</span>
              <Select value={d.language} onChange={set("language")} label="Idioma do CV"
                options={Object.entries(LANGUAGES).map(([value, name]) => ({ value, label: name }))} /></label>
            <label class="fld"><span class="fld-label">Formato de data</span>
              <Select value={d.dateFormat} onChange={set("dateFormat")} label="Formato de data"
                options={Object.keys(DATE_FORMATS).map((value) => ({ value, label: formatDate("2024-03", value, d.language) }))} /></label>
            <label class="fld"><span class="fld-label">Formato da página</span>
              <Select value={d.page} onChange={set("page")} label="Formato da página"
                options={[{ value: "A4", label: "A4" }, { value: "Letter", label: "US Letter" }]} /></label>
          </div>
          <p class="hint">O idioma do CV muda palavras como “Atual” e “Página” e o nome dos meses.</p>
          {untranslated.length > 0 && (
            <button type="button" class="btn btn-secondary btn-sm" onClick={translateHeadings}><Languages size={15} />Traduzir títulos das secções</button>
          )}
        </Card>

        <Card id="templates" title="Modelos de design">
          <p class="hint">Muda o visual completo num clique. O conteúdo mantém-se e podes sempre anular.</p>
          <TemplateThumbs resume={resume} design={d} onPick={(id) => update((r) => { r.design = applyTemplate(r.design, id); })} />
        </Card>

        <Card id="layout" title="Disposição">
          <Sub title="Colunas">
            <Seg value={d.columns} label="Colunas"
              onChange={(v) => update((r) => {
                r.design.columns = v;
                if (v === "one" && r.design.colorArea === "sidebar") r.design.colorArea = "header";
              })}
              options={[["one", "Uma", bars([1])], ["two", "Duas", d.sideSide === "left" ? bars([1, 2]) : bars([2, 1])]]} />
          </Sub>
          {twoCols && <>
            <Sub title="Posição da barra lateral">
              <Seg value={d.sideSide} label="Posição da barra lateral" onChange={set("sideSide")} options={[["left", "Esquerda"], ["right", "Direita"]]} />
            </Sub>
            <Sub title="Posição do cabeçalho">
              <Seg value={d.headerPosition} label="Posição do cabeçalho" onChange={set("headerPosition")} options={[["top", "Topo"], ["side", "Na barra lateral"]]} />
            </Sub>
            <Range label="Largura da barra lateral" value={d.sideWidth} min={24} max={45} step={1} unit="%" onChange={set("sideWidth", true)} />
            <Sub title="Coluna de cada secção">
              <div class="col-assign">
                {resume.sections.map((s) => (
                  <div class="col-row" key={s.id}>
                    <span class="col-name"><SectionIcon type={s.type} size={16} /> {s.heading}</span>
                    <Seg value={s.column ?? "main"} label={`Coluna de ${s.heading}`}
                      onChange={(v) => update((r) => { const x = r.sections.find((y) => y.id === s.id); if (x) x.column = v; })}
                      options={[["main", "Principal"], ["side", "Lateral"]]} />
                  </div>
                ))}
              </div>
            </Sub>
          </>}
        </Card>

        <Card id="fontsize" title="Tamanho de letra">
          <Range label="Tamanho base" value={d.fontSize} min={8} max={12.5} step={0.5} unit="pt" onChange={set("fontSize", true)} />
          <Range label="Nome" value={d.nameOffset} min={4} max={24} step={1} unit="pt" format={(v) => `+${v}`} onChange={set("nameOffset", true)} />
          <Range label="Títulos das secções" value={d.headingOffset} min={0} max={6} step={0.5} unit="pt" format={(v) => `+${v}`} onChange={set("headingOffset", true)} />
          <Range label="Títulos das entradas" value={d.entryOffset} min={0} max={3} step={0.5} unit="pt" format={(v) => `+${v}`} onChange={set("entryOffset", true)} />
        </Card>

        <Card id="spacing" title="Espaçamento">
          <Range label="Altura da linha" value={d.lineHeight} min={1} max={1.8} step={0.05} onChange={set("lineHeight", true)} format={(v) => v.toFixed(2)} />
          <Range label="Espaço entre entradas" value={d.gap} min={1} max={10} step={0.5} unit="mm" onChange={set("gap", true)} />
          <Range label="Margens laterais" value={d.marginX} min={8} max={30} step={1} unit="mm" onChange={set("marginX", true)} />
          <Range label="Margens superior e inferior" value={d.marginY} min={8} max={30} step={1} unit="mm" onChange={set("marginY", true)} />
        </Card>

        <Card id="entries" title="Entradas">
          <Sub title="Estrutura">
            <Seg value={d.entryLayout} label="Estrutura" onChange={set("entryLayout")} options={[["stacked", "Largura total"], ["dates-left", "Datas à esquerda"]]} />
          </Sub>
          {d.entryLayout === "stacked" && <Sub title="Posição da data e localidade">
            <Seg value={d.datePosition} label="Posição da data e localidade" onChange={set("datePosition")} options={[["right", "Direita"], ["below", "Por baixo do título"]]} />
          </Sub>}
          <Sub title="Posição do subtítulo">
            <Seg value={d.subtitlePlacement} label="Posição do subtítulo" onChange={set("subtitlePlacement")} options={[["same-line", "Na mesma linha"], ["below", "Por baixo do título"]]} />
          </Sub>
          <Check label="Localidade em itálico" checked={d.metaItalic} onChange={set("metaItalic")} />
        </Card>

        <Card id="headings" title="Títulos">
          <Sub title="Estilo">
            <Seg value={d.headingStyle} label="Estilo" onChange={set("headingStyle")}
              options={[["line", "Linha"], ["plain", "Simples"], ["box", "Caixa"], ["bar", "Barra"], ["underline", "Linha curta"]]} />
          </Sub>
          <Sub title="Maiúsculas">
            <Seg value={d.headingCase} label="Maiúsculas" onChange={set("headingCase")} options={[["none", "Como escrito"], ["capitalize", "Iniciais Maiúsculas"], ["upper", "MAIÚSCULAS"]]} />
          </Sub>
        </Card>

        <Card id="font" title="Tipo de letra">
          <div class="grid2">
            <label class="fld"><span class="fld-label">Texto</span>
              <Select value={d.bodyFont} onChange={set("bodyFont")} label="Texto" options={fontOptions} onOpen={loadFontPreviews} /></label>
            <label class="fld"><span class="fld-label">Nome e títulos</span>
              <Select value={d.nameFont} onChange={set("nameFont")} label="Nome e títulos" onOpen={loadFontPreviews}
                options={[{ value: "same", label: "Igual ao texto" }, ...fontOptions]} /></label>
          </div>
          <div class="font-quick">
            {["Inter", "Lato", "Source Sans 3", "Montserrat", "Merriweather", "EB Garamond", "Lora", "Roboto Slab"].map((f) => (
              <button type="button" class={`font-chip${d.bodyFont === f ? " on" : ""}`} aria-pressed={d.bodyFont === f} style={{ fontFamily: fontStack(f) }} onClick={() => set("bodyFont")(f)}>{f}</button>
            ))}
          </div>
        </Card>

        <Card id="colors" title="Cores">
          <Sub title="Área de cor">
            <Seg value={d.colorArea} label="Área de cor" onChange={set("colorArea")}
              options={[["none", "Só destaques"], ["header", "Cabeçalho"], ...(twoCols ? [["sidebar", "Barra lateral"]] : []), ["border", "Moldura"]]} />
          </Sub>
          <Sub title="Cor de destaque">
            <div class="swatches">
              {ACCENTS.map((c) => (
                <button type="button" class={`swatch${d.accent === c ? " on" : ""}`} style={{ background: c }} aria-label={`Cor ${c}`} aria-pressed={d.accent === c} onClick={() => set("accent")(c)} />
              ))}
              <label class={`swatch swatch-custom${ACCENTS.includes(d.accent) ? "" : " on"}`} title="Cor personalizada">
                <input type="color" value={d.accent} aria-label="Cor personalizada" onInput={(e) => set("accent", true)(e.currentTarget.value)} />
                <Plus size={16} aria-hidden="true" />
              </label>
            </div>
          </Sub>
          <Sub title="Aplicar a cor de destaque a">
            <div class="checks">
              {["name", "title", "headings", "headingLine", "headerIcons", "dates", "entryTitle", "entrySubtitle", "linkIcons", "levels"]
                .map((k) => <Check label={ACCENT_TARGETS[k]} checked={d.accentOn[k]} onChange={setAcc(k)} />)}
            </div>
          </Sub>
        </Card>

        <Card id="header" title="Cabeçalho">
          <Check label="Nome em versaletes" checked={d.nameSmallCaps} onChange={set("nameSmallCaps")} />
          <Sub title="Alinhamento"><Seg value={d.headerAlign} label="Alinhamento" onChange={set("headerAlign")} options={[["left", "Esquerda"], ["center", "Centro"]]} /></Sub>
          <Sub title="Disposição dos contactos"><Seg value={d.detailsStyle} label="Disposição dos contactos" onChange={set("detailsStyle")} options={[["icon", "Ícones"], ["bullet", "Pontos •"], ["bar", "Barras |"]]} /></Sub>
          {d.detailsStyle === "icon" && <Sub title="Estilo dos ícones">
            <Seg value={d.iconStyle} label="Estilo dos ícones" onChange={set("iconStyle")} options={[["plain", "Sem moldura"], ["circle", "Círculo"], ["square", "Quadrado"], ["outline", "Contorno"]]} />
          </Sub>}
        </Card>

        <Card id="photo" title="Foto">
          {!resume.personal.photo && <p class="hint">Adiciona uma foto em Conteúdo → Dados pessoais para a veres no CV.</p>}
          <Check label="Mostrar foto" checked={d.photoShow} onChange={set("photoShow")} />
          <Range label="Tamanho" value={d.photoSize} min={16} max={45} step={1} unit="mm" onChange={set("photoSize", true)} />
          <Sub title="Forma"><Seg value={d.photoShape} label="Forma" onChange={set("photoShape")} options={[["circle", "Círculo"], ["rounded", "Arredondada"], ["square", "Quadrada"]]} /></Sub>
          <Check label="Preto e branco" checked={d.photoGray} onChange={set("photoGray")} />
        </Card>

        <Card id="skills" title="Competências">
          <Sub title="Disposição de competências e idiomas">
            <Seg value={d.compactLayout} label="Disposição de competências e idiomas" onChange={set("compactLayout")} options={[["grid", "Grelha com níveis"], ["lines", "Linhas (título: detalhes)"]]} />
          </Sub>
          <p class="hint">Como aparece o nível de 1 a 5 nas competências e idiomas.</p>
          <Seg value={d.levelStyle} label="Competências" onChange={set("levelStyle")}
            options={[["dots", "Pontos", <span class="lvl-demo">●●●○○</span>], ["bar", "Barra", <span class="lvl-demo-bar"><i /></span>], ["none", "Escondido"]]} />
        </Card>

        <Card id="links" title="Ligações">
          <Check label="Sublinhar ligações" checked={d.linkUnderline} onChange={set("linkUnderline")} />
          <Check label="Ligações a azul" checked={d.linkBlue} onChange={set("linkBlue")} />
          <Check label="Ícone de ligação depois do título das entradas" checked={d.linkIcon} onChange={set("linkIcon")} />
        </Card>

        <Card id="footer" title="Rodapé">
          <Check label="Números de página" checked={d.footerPageNumbers} onChange={set("footerPageNumbers")} />
          <Check label="Nome" checked={d.footerName} onChange={set("footerName")} />
          <Check label="Email" checked={d.footerEmail} onChange={set("footerEmail")} />
        </Card>
      </div>
    </div>
  );
}
