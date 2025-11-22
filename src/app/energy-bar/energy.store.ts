import { inject, injectable } from 'inversify';
import { action, computed, makeObservable, observable } from 'mobx';

import { ApiClient } from '@app/common/api-client';
import { Scheduler } from '@app/common/scheduler';
import { TelegramService } from '@app/entry/services/telegram.service';
import {
  EnergyRegenLevel,
  EnergyValueLevel,
  getEnergyRegenValueByLevel,
  getEnergyValueByLevel,
} from '@app/game/game-levels';
import { EnvUtils, isSomething } from '@utils';

type SyncEnergyResponse = Readonly<{
  ok?: boolean;
  activeEnergy?: number;
}>;

@injectable()
export class EnergyStore {
  private readonly _syncBaseIntervalMs = 5000;
  private readonly _syncMaxIntervalMs = 30000;
  private readonly _syncDebounceMs = 2000;

  @observable
  private _availableEnergyValue: number = 0;
  @observable
  private _energyTotalLevel: EnergyValueLevel = EnergyValueLevel.LEVEL_1;
  @observable
  private _energyRegenLevel: EnergyRegenLevel = EnergyRegenLevel.LEVEL_1;
  @observable
  private _isEnergyAvailable: boolean = true;

  private readonly _regenerationSpeed: number = 100;
  private _intervalId: number | null = null;
  private _syncIntervalId: number | null = null;
  private _syncDebounceId: number | null = null;
  private _currentSyncIntervalMs: number = this._syncBaseIntervalMs;
  private _lastSyncedEnergy: number = 0;

  constructor(
    @inject(ApiClient) private readonly _apiClient: ApiClient,
    @inject(TelegramService)
    private readonly _telegramService: TelegramService,
    @inject(Scheduler) private readonly _scheduler: Scheduler,
  ) {
    makeObservable(this);

    if (this._availableEnergyValue !== this.energyTotalValue) {
      this._telegramService.enableClosingConfirmation();
    } else {
      this._telegramService.disableClosingConfirmation();
    }
  }

  @computed
  get availableEnergyValue(): number {
    return this._availableEnergyValue;
  }

  @computed
  get energyTotalLevel(): number {
    return this._energyTotalLevel;
  }

  @computed
  get energyRegenLevel(): number {
    return this._energyRegenLevel;
  }

  @computed
  get energyTotalValue(): number {
    return getEnergyValueByLevel(this._energyTotalLevel);
  }

  @computed
  get energyRegenValue(): number {
    return getEnergyRegenValueByLevel(this._energyRegenLevel);
  }

  @computed
  get isEnergyAvailable(): boolean {
    return this._isEnergyAvailable;
  }

  @action
  setAvailableEnergy(value: number) {
    this._availableEnergyValue = value;
  }

  @action
  setEnergyTotalLevel(level: EnergyValueLevel) {
    this._energyTotalLevel = level;
  }

  @action
  setEnergyRegenLevel(level: EnergyRegenLevel) {
    this._energyRegenLevel = level;
  }

  @action
  setEnergyAvailable(value: boolean): void {
    this._isEnergyAvailable = value;
  }

  @action
  setAvailableEnergyValue(value: number): void {
    this._availableEnergyValue = value;
    this.scheduleSyncDebounced();
  }

  @action
  decrementEnergy(amount: number) {
    this.setAvailableEnergyValue(
      Math.max(this._availableEnergyValue - amount, 0),
    );
  }

  @action
  regeneratePoints() {
    this.setAvailableEnergyValue(
      Math.min(
        this._availableEnergyValue + this.energyRegenValue,
        this.energyTotalValue,
      ),
    );
  }

  @action
  async syncEnergyWithServer() {
    if (this._availableEnergyValue === this.energyTotalValue) {
      return;
    }
    if (this._availableEnergyValue === this._lastSyncedEnergy) {
      return;
    }
    try {
      const response = await this._apiClient.post<SyncEnergyResponse>(
        EnvUtils.apiEndpoints.updateEnergy,
        {
          initData: this._telegramService.initData,
          activeEnergy: Math.ceil(this._availableEnergyValue),
        },
      );

      if (response && 'ok' in response && response.ok === false) {
        throw new Error('Energy sync failed');
      }

      if ('activeEnergy' in response && response.activeEnergy !== undefined) {
        this.setAvailableEnergyValue(response.activeEnergy);
      }
      this._lastSyncedEnergy = this._availableEnergyValue;
      this._currentSyncIntervalMs = this._syncBaseIntervalMs;
    } catch (error) {
      if (isSomething(this._telegramService.webApp)) {
        this._telegramService.close();
      }
      this._currentSyncIntervalMs = Math.min(
        this._currentSyncIntervalMs * 2,
        this._syncMaxIntervalMs,
      );
      console.error('Failed to sync active energy with server', error);
    }
  }

  startRegeneration() {
    if (this._intervalId) {
      this._scheduler.clearInterval(this._intervalId);
    }
    this._intervalId = this._scheduler.setInterval(() => {
      this.regeneratePoints();
    }, this._regenerationSpeed);
  }

  startSyncWithServer() {
    if (this._syncIntervalId) {
      this._scheduler.clearInterval(this._syncIntervalId);
    }
    this.scheduleSyncLoop();
  }

  private scheduleSyncLoop() {
    if (this._syncIntervalId) {
      this._scheduler.clearInterval(this._syncIntervalId);
    }
    this._syncIntervalId = this._scheduler.setInterval(() => {
      this.syncEnergyWithServer();
      this.scheduleSyncLoop();
    }, this._currentSyncIntervalMs);
  }

  private scheduleSyncDebounced() {
    if (this._syncDebounceId) {
      this._scheduler.clearTimeout(this._syncDebounceId);
    }
    this._syncDebounceId = this._scheduler.setTimeout(() => {
      this.syncEnergyWithServer();
    }, this._syncDebounceMs);
  }
}
