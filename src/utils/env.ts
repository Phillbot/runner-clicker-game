import { ENV_MODE } from './common';

export class EnvUtils {
  static get isProd(): boolean {
    return process.env.REACT_CLICKER_APP_ENV === ENV_MODE.PROD;
  }

  static REACT_CLICKER_APP_BASE_URL =
    process.env.REACT_CLICKER_APP_BASE_TELEGRAM_GAME_ENDPOINT_URL;

  static get avoidTelegramAuth(): boolean {
    return process.env.REACT_CLICKER_APP_AVOID_TELEGRAM_AUTH === 'true';
  }

  static get avoidUnsupportedScreen(): boolean {
    return process.env.REACT_CLICKER_APP_AVOID_UNSUPPORTED_SCREEN === 'true';
  }
}
