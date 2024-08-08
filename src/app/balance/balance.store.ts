import { injectable } from 'inversify';
import { observable, action, makeObservable, runInAction } from 'mobx';
import axios from 'axios';
import { EnvUtils } from '@utils/env';

@injectable()
export class BalanceStore {
  @observable balance: number = 0;
  @observable private _pendingChanges: number = 0;
  private _syncTimeoutId: NodeJS.Timeout | null = null;

  constructor() {
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

    try {
      await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/updateBalance`,
        {
          balance: this._pendingChanges,
          initData: window.Telegram.WebApp.initData,
        },
      );
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
    if (this._syncTimeoutId) {
      clearTimeout(this._syncTimeoutId);
    }
    this._syncTimeoutId = setTimeout(() => {
      this.syncWithServer();
    }, 5000); // Adjust the delay as needed
  }
}
