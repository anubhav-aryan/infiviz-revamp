/**
 * Number formatting for values that get recomputed at interaction time.
 *
 * `toLocaleString` is deliberately avoided everywhere in this app: it depends
 * on the runtime's locale data, so the server and the client can format the
 * same number differently and break hydration. These do the grouping by hand.
 */

/** `5120` → `"5,120"`. Negative and fractional inputs are handled. */
export function group(value: number): string {
  const negative = value < 0;
  const [whole, fraction] = Math.abs(value).toString().split(".");
  let out = "";
  for (let i = 0; i < whole.length; i += 1) {
    if (i > 0 && (whole.length - i) % 3 === 0) out += ",";
    out += whole[i];
  }
  return (negative ? "-" : "") + out + (fraction ? `.${fraction}` : "");
}

/** One-decimal percentage string, the precision this design displays at. */
export function pct1(value: number): string {
  return value.toFixed(1);
}

/** `571` minutes → `"09:31"`. Keeps variant data off wall-clock arithmetic. */
export function clockFromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
