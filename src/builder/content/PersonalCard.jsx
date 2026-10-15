// Personal details: a compact summary that opens into the full form (photo, contacts, extra details).
import { useRef, useState } from "preact/hooks";
import { Camera, Mail, MapPin, Pencil, Phone, Plus, X } from "lucide-preact";
import { DETAIL_TYPES, uid } from "../data.js";
import { useDialogs } from "../../components/Dialogs.jsx";
import { Field, TextInput } from "./fields.jsx";

/** Center-crops to a square (biased up for portraits, where faces usually are) and shrinks to 480px. */
async function preparePhoto(file) {
  const img = await createImageBitmap(file);
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) * 0.25;
  const out = Math.min(480, side);
  const canvas = Object.assign(document.createElement("canvas"), { width: out, height: out });
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, out, out);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
  img.close?.();
  return canvas.toDataURL("image/jpeg", 0.86);
}

function Summary({ p, onOpen }) {
  const contact = [[Mail, p.email, "Email"], [Phone, p.phone, "Telefone"], [MapPin, p.location, "Localidade"]];
  return (
    <div class="card personal-summary" onClick={onOpen} role="button" tabIndex={0} aria-label="Editar dados pessoais"
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}>
      <div class="ps-text">
        <div class={`ps-name${p.name ? "" : " muted"}`}>{p.name || "O teu nome"}</div>
        {p.title && <div class="ps-title">{p.title}</div>}
        {contact.map(([Icon, v, placeholder]) => (
          <div class={`ps-line${v ? "" : " muted"}`}><Icon size={15} aria-hidden="true" />{v || placeholder}</div>
        ))}
      </div>
      <div class="ps-photo">{p.photo ? <img src={p.photo} alt="" /> : <Camera size={28} aria-hidden="true" />}</div>
      <span class="edit-fab" aria-hidden="true"><Pencil size={15} /></span>
    </div>
  );
}

export function PersonalCard({ resume, update }) {
  const dialogs = useDialogs();
  const p = resume.personal;
  const [open, setOpen] = useState(!p.name);
  const set = (key) => (v) => update((d) => { d.personal[key] = v; }, `personal.${key}`);
  const fileRef = useRef(null);

  const onPhoto = async (e) => {
    const file = e.currentTarget.files[0];
    e.currentTarget.value = "";
    if (!file) return;
    try {
      const data = await preparePhoto(file);
      update((d) => { d.personal.photo = data; });
    } catch {
      dialogs.toast("Não foi possível ler essa imagem. Experimenta um JPG ou PNG.", "error", 5000);
    }
  };

  if (!open) return <Summary p={p} onOpen={() => setOpen(true)} />;

  const usedTypes = new Set(p.details.map((d) => d.type));
  return (
    <div class="card">
      <div class="card-head">
        <h2>Dados pessoais</h2>
        <button type="button" class="btn btn-primary" onClick={() => setOpen(false)}>Concluído</button>
      </div>
      <div class="photo-row">
        <button type="button" class="photo-preview" onClick={() => fileRef.current.click()} aria-label={p.photo ? "Mudar foto" : "Carregar foto"}>
          {p.photo ? <img src={p.photo} alt="A tua foto" /> : <Camera size={26} aria-hidden="true" />}
        </button>
        <div class="photo-actions">
          <button type="button" class="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>{p.photo ? "Mudar foto" : "Carregar foto"}</button>
          {p.photo && <button type="button" class="btn btn-ghost btn-sm" onClick={() => update((d) => { d.personal.photo = ""; })}>Remover</button>}
          <span class="hint">Opcional. A forma e o tamanho definem-se em Personalizar → Foto.</span>
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={onPhoto} />
      </div>
      <div class="grid2">
        <Field label="Nome completo" wide><TextInput value={p.name} onInput={set("name")} placeholder="Ana Martins" autoComplete="name" /></Field>
        <Field label="Título profissional" wide><TextInput value={p.title} onInput={set("title")} placeholder="Estudante de Engenharia Informática" /></Field>
        <Field label="Email"><TextInput type="email" value={p.email} onInput={set("email")} placeholder="nome@exemplo.pt" autoComplete="email" /></Field>
        <Field label="Telefone"><TextInput type="tel" value={p.phone} onInput={set("phone")} placeholder="+351 912 345 678" autoComplete="tel" /></Field>
        <Field label="Localidade" wide><TextInput value={p.location} onInput={set("location")} placeholder="Faro, Portugal" /></Field>
        {p.details.map((d, i) => (
          <Field label={DETAIL_TYPES[d.type].label} wide key={d.id}>
            <div class="inline-row">
              <TextInput value={d.value} placeholder={DETAIL_TYPES[d.type].placeholder}
                onInput={(v) => update((r) => { r.personal.details[i].value = v; }, `detail.${d.id}`)} />
              <button type="button" class="icon-btn" aria-label={`Remover: ${DETAIL_TYPES[d.type].label}`} title="Remover"
                onClick={() => update((r) => { r.personal.details.splice(i, 1); })}><X size={16} /></button>
            </div>
          </Field>
        ))}
      </div>
      <div class="chips">
        <span class="chips-label">Adicionar:</span>
        {Object.keys(DETAIL_TYPES).filter((type) => type === "custom" || !usedTypes.has(type)).map((type) => (
          <button type="button" class="chip" onClick={() => update((r) => { r.personal.details.push({ id: uid(), type, value: "" }); })}>
            <Plus size={13} aria-hidden="true" />{DETAIL_TYPES[type].label}
          </button>
        ))}
      </div>
    </div>
  );
}
