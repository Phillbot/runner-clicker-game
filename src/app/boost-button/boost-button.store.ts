import { inject, injectable } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';
import axios from 'axios';
import { GameStore } from '@app/game/game.store';
import { BalanceStore } from '@app/balance/balance.store';
import { EnvUtils } from '@utils/index';

export enum BoostType {
  Mega = 'MEGA',
  Normal = 'NORMAL',
  Tiny = 'TINY',
}

@injectable()
export class BoostStore {
  @observable private _isBoosted: boolean = false;
  @observable private _boostType: BoostType | null = null;
  @observable private _canUseDailyBoost: boolean = false;
  @observable private _timeUntilNextBoost: string = '00:00:00';
  @observable private _lastBoostRun: number = 0; // Время последнего буста в мс

  private _boostIntervalId: NodeJS.Timeout | null = null;
  private _boostTimeoutId: NodeJS.Timeout | null = null;
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  private readonly config = {
    boostDurations: {
      MEGA: 60000, // 1 минута
      NORMAL: 30000, // 30 секунд
      TINY: 15000, // 15 секунд
      DEFAULT: 30000, // По умолчанию 30 секунд
    },
    boostIntervals: {
      MEGA: 500, // 500 мс
      NORMAL: 1000, // 1 секунда
      TINY: 1000, // 1 секунда
      DEFAULT: 1000, // По умолчанию 1 секунда
    },
    boostMultipliers: {
      MEGA: 20,
      NORMAL: 10,
      TINY: 5,
      DEFAULT: 1, // По умолчанию
    },
    dailyBoostCooldown: 24 * 60 * 60 * 1000, // 24 часа в мс
    updateInterval: 1000, // 1 секунда
  };

  constructor(
    @inject(GameStore) private readonly _gameStore: GameStore,
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
  ) {
    makeObservable(this);
    this.startUpdateTimer();
  }

  @computed
  get lastBoostRun(): number {
    return this._lastBoostRun;
  }

  @computed
  get timeUntilNextBoost(): string {
    return this._timeUntilNextBoost;
  }

  @computed
  get isBoosted(): boolean {
    return this._isBoosted;
  }

  @computed
  get boostType(): BoostType | null {
    return this._boostType;
  }

  @computed
  get canUseDailyBoost(): boolean {
    return this._canUseDailyBoost;
  }

  @action
  setInitialBoostData(lastBoostRun: number) {
    this._lastBoostRun = lastBoostRun;
    this.updateBoostAvailability();
  }

  @action
  private updateBoostAvailability() {
    const now = Date.now();
    const elapsedTime = now - this._lastBoostRun;
    const remainingTime = this.config.dailyBoostCooldown - elapsedTime;

    if (remainingTime > 0) {
      const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);

      runInAction(() => {
        this._timeUntilNextBoost = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this._canUseDailyBoost = false;
      });
    } else {
      runInAction(() => {
        this._timeUntilNextBoost = '00:00:00';
        this._canUseDailyBoost = true;
      });
    }
  }

  @action
  async useDailyBoost() {
    if (!this._canUseDailyBoost) return;

    this.toggleBoosted();
    this.saveBoostTimestamp();
    await this.syncBoostData();
  }

  @action
  private toggleBoosted() {
    if (!this._isBoosted) {
      const randomBoostType = this.getRandomBoostType();
      this.startBoost(randomBoostType);

      const boostDuration = this.getBoostDuration(randomBoostType);
      this._boostTimeoutId = setTimeout(() => {
        runInAction(() => {
          this.stopBoost();
        });
      }, boostDuration);
    }
  }

  @action
  private startBoost(boostType: BoostType) {
    this._isBoosted = true;
    this._boostType = boostType;
    this._telegram.enableClosingConfirmation();

    const interval = this.getBoostInterval(boostType);
    if (!this._boostIntervalId) {
      this._boostIntervalId = setInterval(() => {
        runInAction(() => {
          const boostMultiplier = this.getBoostMultiplier(boostType);
          this._balanceStore.incrementBalance(
            this._gameStore.clickCost * boostMultiplier,
          );
          const newClickId = this._gameStore.generateClickMessageId();
          const removeAt = Date.now() + 500;
          this._gameStore.addClickMessage({
            id: newClickId,
            x: 0,
            y: 0,
            removeAt,
          });

          setTimeout(() => {
            runInAction(() => {
              this._gameStore.removeClickMessage(newClickId);
            });
          }, 500);
        });
      }, interval);
    }
  }

  @action
  private stopBoost() {
    if (this._boostIntervalId) {
      clearInterval(this._boostIntervalId);
      this._boostIntervalId = null;
    }
    if (this._boostTimeoutId) {
      clearTimeout(this._boostTimeoutId);
      this._boostTimeoutId = null;
    }
    this._isBoosted = false;
    this._boostType = null;
    this._telegram.disableClosingConfirmation();
  }

  private getRandomBoostType(): BoostType {
    const types = Object.values(BoostType);
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex];
  }

  private getBoostDuration(boostType: BoostType): number {
    return (
      this.config.boostDurations[boostType] ||
      this.config.boostDurations.DEFAULT
    );
  }

  private getBoostInterval(boostType: BoostType): number {
    return (
      this.config.boostIntervals[boostType] ||
      this.config.boostIntervals.DEFAULT
    );
  }

  private getBoostMultiplier(boostType: BoostType): number {
    return (
      this.config.boostMultipliers[boostType] ||
      this.config.boostMultipliers.DEFAULT
    );
  }

  private startUpdateTimer() {
    setInterval(() => {
      this.updateBoostAvailability();
    }, this.config.updateInterval);
  }

  @action
  private async syncBoostData() {
    try {
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/updateBoost`,
        {
          initData: window.Telegram.WebApp.initData,
          lastBoostRun: this._lastBoostRun,
        },
      );

      if (!response.data.ok) {
        throw new Error('Failed to sync boost data');
      }
    } catch (error) {
      console.error('Failed to sync boost data', error);
    }
  }

  @action
  private saveBoostTimestamp() {
    const now = Date.now();
    this._lastBoostRun = now;
    this._canUseDailyBoost = false;
    this.updateBoostAvailability();
  }
}
