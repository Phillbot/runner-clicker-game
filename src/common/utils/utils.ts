export enum ENV_MODE {
  PROD = 'production',
  DEV = 'development',
}

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

export function isDesktop(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return /windows|macintosh|linux/.test(userAgent);
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

export function isProd(): boolean {
  return process.env.REACT_CLICKER_APP_ENV === ENV_MODE.PROD;
}

export const REACT_CLICKER_APP_BASE_URL =
  process.env.REACT_CLICKER_APP_BASE_TELEGRAM_GAME_ENDPOINT_URL;

export function avoidTelegramAuth(): boolean {
  return process.env.REACT_CLICKER_APP_AVOID_TELEGRAM_AUTH === 'true';
}
