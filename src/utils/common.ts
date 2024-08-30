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
  const platform = navigator.platform.toLowerCase();

  const isDesktopAgent = /windows|macintosh|linux/.test(userAgent);
  const isMobileAgent = /mobile|android|touch|tablet/.test(userAgent);
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Платформы, которые, скорее всего, являются настольными
  const desktopPlatforms = ['win32', 'macintel', 'linux'];

  // Проверяем на настольное устройство, если это не мобильное и не сенсорное устройство
  return (
    (isDesktopAgent && !isMobileAgent && !isTouchDevice) ||
    desktopPlatforms.some(platformPart => platform.includes(platformPart))
  );
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

export function isSomething<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNothing<T>(
  value: T | null | undefined,
): value is null | undefined {
  return value === null || value === undefined;
}
