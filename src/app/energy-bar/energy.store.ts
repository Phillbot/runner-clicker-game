import { injectable } from 'inversify';
import { makeObservable, observable, action, computed } from 'mobx';
import axios from 'axios';

import { EnvUtils, generateAuthTokenHeaders, isSomething } from '@utils/index';
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
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  private readonly _regenerationSpeed: number = 100;
  private _intervalId: NodeJS.Timeout | null = null;
  private _syncIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    makeObservable(this);

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
    try {
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/update-energy`,
        {
          initData: window.Telegram.WebApp.initData,
          activeEnergy: Math.ceil(this._availableEnergyValue),
        },
        {
          headers: { ...generateAuthTokenHeaders() },
        },
      );

      if (!response.data.ok) {
        throw new Error('Energy sync failed');
      }

      this.setAvailableEnergyValue(response.data.activeEnergy);
    } catch (error) {
      if (axios.isAxiosError(error) && isSomething(this._telegram)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this._telegram.close();
        }
      }
      console.error('Failed to sync active energy with server', error);
    }
  }

  startRegeneration() {
    if (!this._intervalId) {
      this._intervalId = setInterval(() => {
        this.regeneratePoints();
      }, this._regenerationSpeed);
    }
  }

  startSyncWithServer() {
    if (!this._syncIntervalId) {
      this._syncIntervalId = setInterval(() => {
        this.syncEnergyWithServer();
      }, 5000);
    }
  }
}
