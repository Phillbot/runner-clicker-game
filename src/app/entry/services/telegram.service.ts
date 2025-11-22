import { injectable } from 'inversify';

@injectable()
export class TelegramService {
  get webApp(): WebApp | undefined {
    return window?.Telegram?.WebApp;
  }

  setup(): void {
    const telegram = this.webApp;
    if (!telegram) {
      return;
    }

    telegram.setHeaderColor('#1d2256');
    telegram.ready();
    telegram.disableVerticalSwipes();
    telegram.expand();
    telegram.disableClosingConfirmation();
  }

  close(): void {
    this.webApp?.close();
  }

  disableClosingConfirmation(): void {
    this.webApp?.disableClosingConfirmation();
  }

  enableClosingConfirmation(): void {
    this.webApp?.enableClosingConfirmation();
  }

  get initData(): string {
    return this.webApp?.initData ?? '';
  }

  get referralParam(): string | undefined {
    return this.webApp?.initDataUnsafe?.start_param ?? undefined;
  }

  get platform(): string | undefined {
    return this.webApp?.platform;
  }
}
