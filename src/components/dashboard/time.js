// Relative "edited 5 minutes ago" times for the CV list.
import { useEffect, useState } from "preact/hooks";

const rtf = new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" });
const STEPS = [[60, "second"], [60, "minute"], [24, "hour"], [7, "day"], [4.35, "week"], [12, "month"], [Infinity, "year"]];

/** Re-renders every `ms` so relative times stay current. */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function timeAgo(ts, now) {
  let v = Math.round((ts - now) / 1000);
  for (const [size, unit] of STEPS) {
    if (Math.abs(v) < size) return unit === "second" ? rtf.format(0, "second") : rtf.format(Math.round(v), unit);
    v /= size;
  }
  return "";
}
