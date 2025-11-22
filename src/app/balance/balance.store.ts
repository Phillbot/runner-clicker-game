import { inject, injectable } from 'inversify';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { ApiClient } from '@app/common/api-client';
import { Scheduler } from '@app/common/scheduler';
import { TelegramService } from '@app/entry/services/telegram.service';
import { EnvUtils } from '@utils/env';

@injectable()
export class BalanceStore {
  @observable balance: number = 0;
  @observable private _pendingChanges: number = 0;
  private _syncTimeoutId: number | null = null;

  constructor(
    @inject(ApiClient) private readonly _apiClient: ApiClient,
    @inject(TelegramService)
    private readonly _telegramService: TelegramService,
    @inject(Scheduler) private readonly _scheduler: Scheduler,
  ) {
    makeObservable(this);
  }

  @action
  incrementBalance = (amount: number) => {
    this.balance += amount;
    this._pendingChanges += amount;
    this.scheduleSync();
  };

  @action
  setBalance = (amount: number) => {
    this.balance = amount;
    this._pendingChanges = 0; // Reset pending changes as we assume server data is correct
  };

  @action
  private resetPendingChanges = () => {
    this._pendingChanges = 0;
  };

  @action
  public async syncWithServer() {
    if (this._pendingChanges === 0) return;

    if (EnvUtils.enableMock) {
      runInAction(() => {
        this.resetPendingChanges();
      });
      return;
    }

    this._telegramService.disableClosingConfirmation();

    try {
      await this._apiClient.post(EnvUtils.apiEndpoints.updateBalance, {
        balance: this._pendingChanges,
        initData: this._telegramService.initData,
      });
      runInAction(() => {
        this.resetPendingChanges();
      });
    } catch (error) {
      console.error('Failed to sync balance with server', error);
      // Optionally: retry sync or handle the error as needed
    }
  }

  @action
  private scheduleSync() {
    this._telegramService.enableClosingConfirmation();
    if (this._syncTimeoutId) {
      this._scheduler.clearTimeout(this._syncTimeoutId);
    }
    this._syncTimeoutId = this._scheduler.setTimeout(() => {
      this.syncWithServer();
    }, 500); // Adjust the delay as needed
  }
}
