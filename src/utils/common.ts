import CryptoJS from 'crypto-js';

export enum ENV_MODE {
  PROD = 'production',
  DEV = 'development',
}

export function isDesktop(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  const desktopPlatforms = ['win32', 'macintel', 'linux', 'mac', 'windows'];

  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const isDesktopPlatform = desktopPlatforms.some(platformPart =>
    platform.includes(platformPart),
  );

  const isMobileAgent = /mobile|android|touch|tablet/.test(userAgent);

  return isDesktopPlatform && !isTouchDevice && !isMobileAgent;
}

export function isSomething<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNothing<T>(
  value: T | null | undefined,
): value is null | undefined {
  return value === null || value === undefined;
}

export function generateAuthTokenHeaders(): {
  'X-Token': string;
  'X-Timestamp': number;
} {
  const timestamp = Date.now();

  const salt = import.meta.env.REACT_CLICKER_SALT ?? '';
  const data = `${salt}${timestamp}${timestamp % 2 === 0 ? '{' : '}'}${window.Telegram.WebApp.initData}`;
  const token = CryptoJS.HmacSHA256(data, salt).toString(CryptoJS.enc.Hex);

  return {
    'X-Token': token,
    'X-Timestamp': timestamp,
  };
}
