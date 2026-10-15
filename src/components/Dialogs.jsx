// Promise-based confirm / prompt dialogs and toasts, styled like the rest of the app.
import { createContext } from "preact";
import { useContext, useMemo, useRef, useState } from "preact/hooks";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-preact";
import { Modal } from "./Modal.jsx";

const DialogContext = createContext(null);

function ConfirmDialog({ d, close }) {
  return (
    <Modal title={d.title} onClose={() => close(false)} size="sm" footer={<>
      <button type="button" class="btn btn-ghost" onClick={() => close(false)}>{d.cancel ?? "Cancelar"}</button>
      <button type="button" class={`btn ${d.danger ? "btn-danger" : "btn-primary"}`} autofocus onClick={() => close(true)}>{d.confirm ?? "Confirmar"}</button>
    </>}>
      <p class="dialog-msg">{d.message}</p>
    </Modal>
  );
}

function PromptDialog({ d, close }) {
  const [value, setValue] = useState(d.value ?? "");
  const submit = (e) => { e.preventDefault(); if (value.trim()) close(value.trim()); };
  return (
    <Modal title={d.title} onClose={() => close(null)} size="sm">
      <form onSubmit={submit}>
        <label class="fld">
          {d.label && <span class="fld-label">{d.label}</span>}
          <input class="inp" value={value} maxLength={120} autofocus onInput={(e) => setValue(e.currentTarget.value)}
            onFocus={(e) => e.currentTarget.select()} />
        </label>
        <div class="modal-foot modal-foot-inline">
          <button type="button" class="btn btn-ghost" onClick={() => close(null)}>Cancelar</button>
          <button type="submit" class="btn btn-primary" disabled={!value.trim()}>{d.confirm ?? "Guardar"}</button>
        </div>
      </form>
    </Modal>
  );
}

const TOAST_ICONS = { success: CircleCheck, error: TriangleAlert, info: Info };

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const api = useMemo(() => {
    const open = (kind, options) => new Promise((resolve) => setDialog({ ...options, kind, resolve }));
    const dismiss = (id) => setToasts((list) => list.filter((x) => x.id !== id));
    return {
      confirm: (options) => open("confirm", options),
      prompt: (options) => open("prompt", options),
      toast(message, type = "success", ms = 3200) {
        const id = ++seq.current;
        setToasts((list) => [...list.slice(-3), { id, message, type }]);
        setTimeout(() => dismiss(id), ms);
      },
      dismiss,
    };
  }, []);

  const close = (result) => { dialog?.resolve(result); setDialog(null); };

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog?.kind === "confirm" && <ConfirmDialog d={dialog} close={close} />}
      {dialog?.kind === "prompt" && <PromptDialog d={dialog} close={close} />}
      <div class="toasts" role="status" aria-live="polite">
        {toasts.map((x) => {
          const Icon = TOAST_ICONS[x.type] ?? Info;
          return (
            <div key={x.id} class={`toast toast-${x.type}`}>
              <Icon size={18} aria-hidden="true" />
              <span>{x.message}</span>
              <button type="button" class="toast-x" aria-label="×" onClick={() => api.dismiss(x.id)}><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </DialogContext.Provider>
  );
}

export const useDialogs = () => useContext(DialogContext);
