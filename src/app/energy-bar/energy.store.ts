import { injectable } from 'inversify';
import {
  makeObservable,
  observable,
  action,
  computed,
  runInAction,
} from 'mobx';
import axios from 'axios';

import { EnvUtils } from '@utils/index';
import {
  EnergyRegenLevel,
  EnergyValueLevel,
  getEnergyRegenValueByLevel,
  getEnergyValueByLevel,
} from '@app/game/game-levels';

@injectable()
export class EnergyStore {
  @observable
  private _availableEnergyValue: number = 0;
  @observable
  private _energyTotalLevel: EnergyValueLevel = EnergyValueLevel.LEVEL_1;
  @observable
  private _energyRegenLevel: EnergyRegenLevel = EnergyRegenLevel.LEVEL_1;
  @observable
  private _isEnergyAvailable: boolean = true;

  private readonly _regenerationSpeed: number = 100;
  private _intervalId: NodeJS.Timeout | null = null;
  private _syncIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    makeObservable(this);
    this.startRegeneration();
    this.startSyncWithServer();

    if (this._availableEnergyValue !== this.energyTotalValue) {
      window.Telegram.WebApp.enableClosingConfirmation();
    } else {
      window.Telegram.WebApp.disableClosingConfirmation();
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
  }

  @action
  decrementEnergy(amount: number) {
    this._availableEnergyValue = Math.max(
      this._availableEnergyValue - amount,
      0,
    );
    this.setEnergyAvailable(this._availableEnergyValue >= amount);
  }

  @action
  regeneratePoints() {
    this._availableEnergyValue = Math.min(
      this._availableEnergyValue + this.energyRegenValue,
      this.energyTotalValue,
    );
  }

  @action
  calculateEnergyBasedOnLastLogout(lastLogout: number) {
    const currentTime = new Date().getTime();
    const regenTimeMS = currentTime - lastLogout;
    const regenCycles = Math.floor(regenTimeMS / this._regenerationSpeed);
    const regeneratedEnergy = regenCycles * this.energyRegenValue;

    this._availableEnergyValue = Math.min(
      this._availableEnergyValue + regeneratedEnergy,
      this.energyTotalValue,
    );

    this.setEnergyAvailable(this._availableEnergyValue > 0);
  }

  @action
  async syncEnergyWithServer() {
    if (this._availableEnergyValue === this.energyTotalValue) {
      return;
    }
    try {
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/update-energy`,
        {
          initData: window.Telegram.WebApp.initData,
          activeEnergy: Math.ceil(this._availableEnergyValue),
        },
      );

      if (!response.data.ok) {
        throw new Error('Energy sync failed');
      }

      runInAction(() => {
        this._availableEnergyValue = response.data.activeEnergy;
      });
    } catch (error) {
      console.error('Failed to sync active energy with server', error);
    }
  }

  startRegeneration() {
    if (!this._intervalId) {
      this._intervalId = setInterval(() => {
        runInAction(() => {
          this.regeneratePoints();
        });
      }, this._regenerationSpeed);
    }
  }

  startSyncWithServer() {
    if (!this._syncIntervalId) {
      this._syncIntervalId = setInterval(() => {
        this.syncEnergyWithServer();
      }, 15000); // Sync with server every 15 seconds
    }
  }

  stopRegeneration() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  stopSyncWithServer() {
    if (this._syncIntervalId) {
      clearInterval(this._syncIntervalId);
      this._syncIntervalId = null;
    }
  }
}
