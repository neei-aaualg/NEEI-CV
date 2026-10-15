// Month + year picker that works in every browser. Value is "YYYY-MM", "YYYY" or "".
import { Select } from "../../components/Select.jsx";

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 71 }, (_, i) => String(THIS_YEAR + 8 - i));

export function MonthPicker({ value, onChange, disabled, label }) {
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(value ?? "");

  // Imported free text ("Summer 2019") stays editable as text.
  if (value && !m) {
    return <input class="inp" value={value} disabled={disabled} aria-label={label} onInput={(e) => onChange(e.currentTarget.value)} />;
  }

  const year = m?.[1] ?? "";
  const month = m?.[2] ?? "";
  const set = (y, mo) => onChange(y ? (mo ? `${y}-${mo}` : y) : "");
  const fmt = new Intl.DateTimeFormat("pt-PT", { month: "long" });
  const months = Array.from({ length: 12 }, (_, i) => [String(i + 1).padStart(2, "0"), fmt.format(new Date(2020, i, 1))]);
  const years = year && !YEARS.includes(year) ? [year, ...YEARS] : YEARS;

  return (
    <div class="month-picker" role="group" aria-label={label}>
      <Select value={month} disabled={disabled} label={`${label} — Mês`} placeholder="Mês"
        onChange={(v) => set(year || String(THIS_YEAR), v)}
        options={[{ value: "", label: "Mês" }, ...months.map(([v, name]) => ({ value: v, label: name.charAt(0).toUpperCase() + name.slice(1) }))]} />
      <Select value={year} disabled={disabled} label={`${label} — Ano`} placeholder="Ano"
        onChange={(v) => set(v, v ? month : "")}
        options={[{ value: "", label: "Ano" }, ...years.map((y) => ({ value: y, label: y }))]} />
    </div>
  );
}
