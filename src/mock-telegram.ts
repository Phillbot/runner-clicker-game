/* eslint-disable @typescript-eslint/no-explicit-any */
export function mockTelegramEnv() {
  if (typeof window === 'undefined') return;

  // Mock Telegram WebApp
  window.Telegram = {
    WebApp: {
      initData:
        'query_id=mock&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1680000000&hash=mock_hash',
      initDataUnsafe: {
        query_id: 'mock',
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'en',
        },
        auth_date: 1680000000,
        hash: 'mock_hash',
      },
      version: '6.0',
      platform: 'unknown',
      colorScheme: 'dark',
      themeParams: {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#080808',
        link_color: '#00488f',
        button_color: '#40a7e3',
        button_text_color: '#ffffff',
      },
      isExpanded: true,
      viewportHeight: 600,
      viewportStableHeight: 600,
      headerColor: '#ffffff',
      backgroundColor: '#ffffff',
      isClosingConfirmationEnabled: false,
      BackButton: {
        isVisible: false,
        onClick(_callback: () => void) {
          return this;
        },
        offClick(_callback: () => void) {
          return this;
        },
        show() {
          this.isVisible = true;
          return this;
        },
        hide() {
          this.isVisible = false;
          return this;
        },
      },
      MainButton: {
        text: 'CONTINUE',
        color: '#2481cc',
        textColor: '#ffffff',
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        setText(text: string) {
          this.text = text;
          return this;
        },
        onClick(_callback: () => void) {
          return this;
        },
        offClick(_callback: () => void) {
          return this;
        },
        show() {
          this.isVisible = true;
          return this;
        },
        hide() {
          this.isVisible = false;
          return this;
        },
        enable() {
          this.isActive = true;
          return this;
        },
        disable() {
          this.isActive = false;
          return this;
        },
        showProgress(_leaveActive?: boolean) {
          this.isProgressVisible = true;
          return this;
        },
        hideProgress() {
          this.isProgressVisible = false;
          return this;
        },
        setParams(_params: any) {
          return this;
        },
      },
      HapticFeedback: {
        impactOccurred(_style: string) {
          return this as any;
        },
        notificationOccurred(_type: string) {
          return this as any;
        },
        selectionChanged() {
          return this as any;
        },
      },
      ready: () => console.log('[MockTelegram] WebApp.ready() called'),
      expand: () => console.log('[MockTelegram] WebApp.expand() called'),
      close: () => console.log('[MockTelegram] WebApp.close() called'),
      setHeaderColor: (color: string) =>
        console.log(`[MockTelegram] setHeaderColor(${color})`),
      setBackgroundColor: (color: string) =>
        console.log(`[MockTelegram] setBackgroundColor(${color})`),
      enableClosingConfirmation: () => {},
      disableClosingConfirmation: () => {},
      onEvent: () => {},
      offEvent: () => {},
      sendData: () => {},
      openLink: (url: string) => window.open(url, '_blank'),
      openTelegramLink: (url: string) => window.open(url, '_blank'),
      openInvoice: () => {},
      showPopup: () => {},
      showAlert: () => {},
      showConfirm: () => {},
      showScanQrPopup: () => {},
      closeScanQrPopup: () => {},
      readTextFromClipboard: () => {},
      requestWriteAccess: () => {},
      requestContact: () => {},
      switchInlineQuery: () => {},
      disableVerticalSwipes: () => {},
    } as any,
  };

  // eslint-disable-next-line no-console
  console.info('[MockTelegram] mock environment enabled');
}
