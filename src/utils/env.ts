export class EnvUtils {
  static get isProd(): boolean {
    return (
      import.meta.env.PROD ||
      import.meta.env.REACT_CLICKER_ENV === 'production' ||
      import.meta.env.MODE === 'production'
    );
  }

  static get isDev(): boolean {
    return (
      import.meta.env.DEV ||
      import.meta.env.REACT_CLICKER_ENV === 'development' ||
      import.meta.env.MODE === 'development'
    );
  }

  static get enableMock(): boolean {
    return import.meta.env.REACT_CLICKER_ENABLE_MOCK === 'true';
  }

  static get REACT_CLICKER_APP_BASE_URL(): string {
    return import.meta.env.REACT_CLICKER_BASE_TELEGRAM_GAME_ENDPOINT_URL || '';
  }

  static get avoidTelegramAuth(): boolean {
    return import.meta.env.REACT_CLICKER_AVOID_TELEGRAM_AUTH === 'true';
  }

  static get avoidUnsupportedScreen(): boolean {
    return import.meta.env.REACT_CLICKER_AVOID_UNSUPPORTED_SCREEN === 'true';
  }
}
