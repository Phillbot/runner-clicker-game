import { inject, injectable } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';
import { GameStore } from '@app/game/game.store';
import { BalanceStore } from '@app/balance/balance.store';

export enum BoostType {
  Mega = 'MEGA',
  Normal = 'NORMAL',
  Tiny = 'TINY',
}

@injectable()
export class BoostStore {
  @observable
  private _isBoosted: boolean = false;
  @observable
  private _boostType: BoostType | null = null;
  @observable
  private _canUseDailyBoost: boolean = true;
  @observable
  private _timeUntilNextBoost: string = '';

  private _boostIntervalId: NodeJS.Timeout | null = null;
  private _boostTimeoutId: NodeJS.Timeout | null = null;
  private _dailyBoostTimeoutId: NodeJS.Timeout | null = null;
  private _lastDailyBoostTimestamp: number | null = null; // Mocked storage

  private readonly config = {
    boostDurations: {
      MEGA: 60000, // 1 minute
      NORMAL: 30000, // 30 seconds
      TINY: 15000, // 15 seconds
      DEFAULT: 30000, // Default duration
    },
    boostIntervals: {
      MEGA: 500, // 500 ms
      NORMAL: 1000, // 1 second
      TINY: 1000, // 1 second
      DEFAULT: 1000, // Default interval
    },
    boostMultipliers: {
      MEGA: 20,
      NORMAL: 10,
      TINY: 5,
      DEFAULT: 1, // Default multiplier
    },
    dailyBoostCooldown: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    updateInterval: 1000, // 1 second
  };

  constructor(
    @inject(GameStore) private readonly _gameStore: GameStore,
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
  ) {
    makeObservable(this);
    this.checkDailyBoostAvailability();
    this.startUpdateTimer();
  }

  @action
  toggleBoosted = () => {
    if (!this._isBoosted) {
      const randomBoostType = this.getRandomBoostType();
      this.startBoost(randomBoostType);

      const randomBoostDuration = this.getBoostDuration(randomBoostType);
      this._boostTimeoutId = setTimeout(() => {
        runInAction(() => {
          this.stopBoost();
        });
      }, randomBoostDuration);
    }
  };

  @action
  useDailyBoost = () => {
    if (this._canUseDailyBoost) {
      this.toggleBoosted();
      this.saveDailyBoostTimestamp();
      this._canUseDailyBoost = false;
      this.startDailyBoostCooldown();
    }
  };

  @action
  private startBoost = (boostType: BoostType) => {
    this._isBoosted = true;
    this._boostType = boostType;

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
  };

  @action
  private stopBoost = () => {
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
  };

  private getRandomBoostType = (): BoostType => {
    const types = Object.values(BoostType);
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex];
  };

  private getBoostDuration = (boostType: BoostType): number => {
    return (
      this.config.boostDurations[boostType] ||
      this.config.boostDurations.DEFAULT
    );
  };

  private getBoostInterval = (boostType: BoostType): number => {
    return (
      this.config.boostIntervals[boostType] ||
      this.config.boostIntervals.DEFAULT
    );
  };

  private getBoostMultiplier = (boostType: BoostType): number => {
    return (
      this.config.boostMultipliers[boostType] ||
      this.config.boostMultipliers.DEFAULT
    );
  };

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

  @computed
  get timeUntilNextBoost(): string {
    return this._timeUntilNextBoost;
  }

  @computed
  get currentBoostType(): BoostType | null {
    return this._isBoosted ? this._boostType : null;
  }

  @action
  private saveDailyBoostTimestamp() {
    const now = Date.now();
    this._lastDailyBoostTimestamp = now;
  }

  @action
  private checkDailyBoostAvailability() {
    const lastBoostTimestamp = this._lastDailyBoostTimestamp;
    if (lastBoostTimestamp) {
      const now = Date.now();
      const timeSinceLastBoost = now - lastBoostTimestamp;
      const hoursSinceLastBoost =
        timeSinceLastBoost / this.config.dailyBoostCooldown;

      runInAction(() => {
        this._canUseDailyBoost = hoursSinceLastBoost >= 1;
      });
    } else {
      runInAction(() => {
        this._canUseDailyBoost = true;
      });
    }
  }

  @action
  private startDailyBoostCooldown() {
    if (this._dailyBoostTimeoutId) {
      clearTimeout(this._dailyBoostTimeoutId);
    }

    this._dailyBoostTimeoutId = setTimeout(() => {
      runInAction(() => {
        this._canUseDailyBoost = true;
      });
    }, this.config.dailyBoostCooldown);
  }

  private startUpdateTimer() {
    setInterval(() => {
      if (!this._canUseDailyBoost && this._lastDailyBoostTimestamp) {
        const now = Date.now();
        const timeSinceLastBoost = now - this._lastDailyBoostTimestamp;
        const remainingTime =
          this.config.dailyBoostCooldown - timeSinceLastBoost;

        if (remainingTime > 0) {
          const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
          const seconds = Math.floor((remainingTime / 1000) % 60);

          runInAction(() => {
            this._timeUntilNextBoost = `${hours}:${minutes}:${seconds}`;
          });
        } else {
          runInAction(() => {
            this._timeUntilNextBoost = '';
            this._canUseDailyBoost = true;
          });
        }
      }
    }, this.config.updateInterval);
  }
}
