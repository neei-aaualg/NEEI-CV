// NEEI-branded site chrome: header, footer and theme toggle.
import { ArrowLeft, FileText, Moon, Sun } from "lucide-preact";
import { Link } from "../lib/router.jsx";
import { useTheme } from "../lib/theme.js";

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
  </svg>
);

export function Brand({ compact = false }) {
  return (
    <Link href="/" class={`brand${compact ? " brand-compact" : ""}`} aria-label="NEEI CV — Os meus CVs" title="NEEI CV — Os meus CVs">
      <img src="/neei-logo-transp.png" alt="NEEI" width="62" height="40" />
      <span class="brand-pill"><FileText size={12} aria-hidden="true" />CV</span>
    </Link>
  );
}

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const label = dark ? "Ativar tema claro" : "Ativar tema escuro";
  return (
    <button type="button" class="round-btn theme-btn" onClick={toggle} title={label} aria-label={label}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function BackToSite() {
  return (
    <a href="https://neei.online" class="pill-link" title="Voltar ao site do NEEI">
      <ArrowLeft size={14} aria-hidden="true" />
      <span class="hide-sm">Voltar ao site do NEEI</span>
      <span class="show-sm">NEEI</span>
    </a>
  );
}

export function SiteHeader() {
  return (
    <header class="site-header">
      <div class="container header-inner">
        <div class="header-left">
          <Brand />
          <nav class="site-nav" aria-label="NEEI CV">
            <Link href="/" class="nav-link active" aria-current="page">Os meus CVs</Link>
          </nav>
        </div>
        <div class="header-actions">
          <ThemeToggle />
          <BackToSite />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer class="site-footer">
      <div class="container footer-inner">
        <p>
          © {new Date().getFullYear()} NEEI CV · <strong>Núcleo de Estudantes de Engenharia Informática</strong> — Universidade do Algarve
        </p>
        <nav class="footer-nav" aria-label="NEEI">
          <a href="https://neei.online">Site do NEEI</a>
          <a href="https://box.neei.online">NEEIBox</a>
          <a href="https://github.com/neei-aaualg" class="footer-gh"><GithubIcon />GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
