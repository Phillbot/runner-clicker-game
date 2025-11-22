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

  static get apiEndpoints(): Readonly<{
    getMe: string;
    createUser: string;
    updateLastLogin: string;
    updateEnergy: string;
    updateAbility: string;
    updateBalance: string;
    updateBoost: string;
    referralClaimReward: string;
  }> {
    return {
      getMe:
        import.meta.env.REACT_CLICKER_ENDPOINT_GET_ME ??
        '/react-clicker-bot/get-me',
      createUser:
        import.meta.env.REACT_CLICKER_ENDPOINT_CREATE_USER ??
        '/react-clicker-bot/create-user',
      updateLastLogin:
        import.meta.env.REACT_CLICKER_ENDPOINT_UPDATE_LAST_LOGIN ??
        '/react-clicker-bot/update-last-login',
      updateEnergy:
        import.meta.env.REACT_CLICKER_ENDPOINT_UPDATE_ENERGY ??
        '/react-clicker-bot/update-energy',
      updateAbility:
        import.meta.env.REACT_CLICKER_ENDPOINT_UPDATE_ABILITY ??
        '/react-clicker-bot/update-ability',
      updateBalance:
        import.meta.env.REACT_CLICKER_ENDPOINT_UPDATE_BALANCE ??
        '/react-clicker-bot/update-balance',
      updateBoost:
        import.meta.env.REACT_CLICKER_ENDPOINT_UPDATE_BOOST ??
        '/react-clicker-bot/update-boost',
      referralClaimReward:
        import.meta.env.REACT_CLICKER_ENDPOINT_REFERRAL_CLAIM_REWARD ??
        '/react-clicker-bot/referral-claim-reward',
    };
  }

  static apiUrl(path: string): string {
    const base = (this.REACT_CLICKER_APP_BASE_URL || '').replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  static get avoidTelegramAuth(): boolean {
    return import.meta.env.REACT_CLICKER_AVOID_TELEGRAM_AUTH === 'true';
  }

  static get avoidUnsupportedScreen(): boolean {
    return import.meta.env.REACT_CLICKER_AVOID_UNSUPPORTED_SCREEN === 'true';
  }
}
