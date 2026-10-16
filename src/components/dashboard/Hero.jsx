// Top of the home page: an introduction for first-time visitors, a compact header for people who already have CVs.
import { ArrowDown } from "lucide-preact";
import { PageThumb } from "../PageThumb.jsx";

const STEPS = [
  ["Escolhe um modelo", "Sete designs, do clássico em LaTeX ao moderno com cor."],
  ["Preenche o teu percurso", "Experiência, formação, projetos e competências, vês o resultado enquanto escreves."],
  ["Descarrega em PDF", "Um PDF com texto selecionável, pronto a enviar para estágios e empregos."],
];

// Templates fanned out beside the introduction (decorative).
const FAN = ["sidebar", "classic", "neei"];

function TemplateFan({ previews }) {
  const pages = FAN.map((id) => previews.find((p) => p.id === id)).filter(Boolean);
  return (
    <div class="hero-fan" aria-hidden="true">
      {pages.map(({ id, design, sample }, i) => (
        <span class={`hero-page hero-page-${i}`} key={id}><PageThumb resume={sample} design={design} /></span>
      ))}
    </div>
  );
}

export function WelcomeHero({ previews, onStart }) {
  return (
    <section class="dash-hero dash-hero-welcome">
      <div class="dash-hero-text">
        <h1>Cria um CV profissional em minutos</h1>
        <p class="lead">
          Escolhe um modelo, preenche as tuas experiências e descarrega um PDF pronto a enviar.
          Não precisas de criar conta.
        </p>
        <ol class="steps">
          {STEPS.map(([title, text], i) => (
            <li>
              <span class="step-n" aria-hidden="true">{i + 1}</span>
              <span><strong>{title}</strong><span class="step-text">{text}</span></span>
            </li>
          ))}
        </ol>
        <button type="button" class="btn btn-primary btn-lg hero-cta" onClick={onStart}>Escolher um modelo<ArrowDown size={17} /></button>
      </div>
      <TemplateFan previews={previews} />
    </section>
  );
}

export function ReturningHero() {
  return (
    <section class="dash-hero dash-hero-compact">
      <h1>Os meus CVs</h1>
      <p class="lead">Continua onde ficaste ou começa um CV novo a partir de um modelo.</p>
    </section>
  );
}
