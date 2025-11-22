const compactFormatter = Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

export function formatCompactNumber(num: number): string {
  return compactFormatter.format(num);
}
