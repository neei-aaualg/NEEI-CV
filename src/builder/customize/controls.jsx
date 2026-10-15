// Form controls for the Customize tab: segmented buttons, sliders, checkboxes and setting cards.

export function Seg({ value, options, onChange, label: aria }) {
  return (
    <div class="seg" role="radiogroup" aria-label={aria}>
      {options.map(([v, text, preview]) => (
        <button type="button" role="radio" aria-checked={value === v} class={`seg-btn${value === v ? " on" : ""}`} onClick={() => onChange(v)}>
          {preview && <span class="seg-preview" aria-hidden="true">{preview}</span>}
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}

export function Range({ label: text, value, min, max, step, unit = "", onChange, format = (v) => v }) {
  return (
    <label class="range">
      <span class="range-head"><span>{text}</span><span class="range-val">{format(value)}{unit}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onInput={(e) => onChange(Number(e.currentTarget.value))} />
    </label>
  );
}

export function Check({ label: text, checked, onChange }) {
  return <label class="check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} /> {text}</label>;
}

export function Card({ id, title, children }) {
  return <section class="card cust-card" id={`cust-${id}`} aria-labelledby={`cust-h-${id}`}><h2 id={`cust-h-${id}`}>{title}</h2>{children}</section>;
}

export function Sub({ title, children }) {
  return <div class="cust-sub"><h4>{title}</h4>{children}</div>;
}

// Small layout pictograms for the segmented buttons.
export const bars = (cols) => <span class="pict">{cols.map((w) => <span class="pict-col" style={{ flex: w }}><i /><i /><i /></span>)}</span>;
