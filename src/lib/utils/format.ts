export function formatPrice(amount: number): string {
  const rounded = Math.round(amount);
  const withSeparators = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  return `Rp${withSeparators}`;
}
