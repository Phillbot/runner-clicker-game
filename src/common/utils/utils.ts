export function formatNumber(num: number): string {
  const thresholds = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];

  for (const { value, suffix } of thresholds) {
    if (num >= value) {
      return (
        (num / value).toFixed(2).replace(/(\.0+|(\.\d*[1-9])0+)$/, '$2') +
        suffix
      );
    }
  }

  return num.toString();
}

export function isDesktop() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /windows|macintosh|linux/.test(userAgent);
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
