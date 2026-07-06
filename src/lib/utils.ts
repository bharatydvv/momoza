export function formatMoney(n: number): string {
  return `₹${Number(n || 0).toFixed(0)}`;
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
