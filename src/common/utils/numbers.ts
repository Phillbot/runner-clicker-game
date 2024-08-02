export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (
      (num / 1e9).toFixed(num % 1e9 === 0 ? 0 : 3).replace(/\.0*$/, '') + 'B'
    );
  }
  if (num >= 1e6) {
    return (
      (num / 1e6).toFixed(num % 1e6 === 0 ? 0 : 3).replace(/\.0*$/, '') + 'M'
    );
  }
  if (num >= 1e3) {
    return (
      (num / 1e3).toFixed(num % 1e3 === 0 ? 0 : 2).replace(/\.0*$/, '') + 'K'
    );
  }
  return num.toString();
}
