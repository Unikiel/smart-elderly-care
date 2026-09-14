export function uid(prefix = "id") {
  const n = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${n}`;
}
