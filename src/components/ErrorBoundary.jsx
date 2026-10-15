// Catches render errors so one bad CV can't leave a blank page.
import { Component } from "preact";
import { TriangleAlert } from "lucide-preact";

export class ErrorBoundary extends Component {
  state = { error: null };

  componentDidCatch(error) {
    console.error(error);
    this.setState({ error });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div class="crash">
        <TriangleAlert size={40} aria-hidden="true" />
        <h1>Algo correu mal</h1>
        <p>Os teus CVs continuam guardados neste navegador. Recarrega a página para continuar.</p>
        <button type="button" class="btn btn-primary" onClick={() => location.assign("/")}>Recarregar</button>
      </div>
    );
  }
}
