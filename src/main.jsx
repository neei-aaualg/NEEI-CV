// NEEI CV: resume builder for the students of the University of the Algarve (cv.neei.online).
import { render } from "preact";
import { useEffect } from "preact/hooks";
import "./styles/app.css";
import { RESUME_CSS } from "./builder/resume-css.js";
import { LOCAL_FONTS, localFontCss } from "./builder/data.js";
import { StoreProvider } from "./lib/store.jsx";
import { matchEditor, navigate, useRoute } from "./lib/router.jsx";
import { DialogProvider } from "./components/Dialogs.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Editor } from "./pages/Editor.jsx";

// Resume styles are shared with the PDF document, so they live in JS and are injected once here,
// together with the @font-face rules of the bundled fonts (they only download when a CV uses them).
document.head.append(Object.assign(document.createElement("style"), { id: "resume-css", textContent: `${RESUME_CSS}
${localFontCss(Object.keys(LOCAL_FONTS))}` }));

function Routes() {
  const path = useRoute();
  const id = matchEditor(path);
  useEffect(() => { if (!id && path !== "/") navigate("/", { replace: true }); }, [path]);
  return id ? <Editor id={id} /> : <Dashboard />;
}

function App() {
  return (
    <ErrorBoundary>
        <StoreProvider>
          <DialogProvider>
            <Routes />
          </DialogProvider>
        </StoreProvider>
    </ErrorBoundary>
  );
}

render(<App />, document.getElementById("app"));
