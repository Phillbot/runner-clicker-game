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
  @observable isBoosted: boolean = false;
  @observable boostType: BoostType | null = null;
  @observable canUseDailyBoost: boolean = true;
  @observable timeUntilNextBoost: string = '';

  private boostIntervalId: NodeJS.Timeout | null = null;
  private boostTimeoutId: NodeJS.Timeout | null = null;
  private dailyBoostTimeoutId: NodeJS.Timeout | null = null;
  private lastDailyBoostTimestamp: number | null = null; // Mocked storage

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
    if (!this.isBoosted) {
      const randomBoostType = this.getRandomBoostType();
      this.isBoosted = true;
      this.boostType = randomBoostType;
      this.startBoost(randomBoostType);

      const randomBoostDuration = this.getBoostDuration(randomBoostType);
      this.boostTimeoutId = setTimeout(() => {
        runInAction(() => {
          this.stopBoost();
          this.isBoosted = false;
          this.boostType = null;
        });
      }, randomBoostDuration);
    }
  };

  @action
  useDailyBoost = () => {
    if (this.canUseDailyBoost) {
      this.toggleBoosted();
      this.saveDailyBoostTimestamp();
      this.canUseDailyBoost = false;
      this.startDailyBoostCooldown();
    }
  };

  startBoost = (boostType: BoostType) => {
    const interval = this.getBoostInterval(boostType);
    if (!this.boostIntervalId) {
      this.boostIntervalId = setInterval(() => {
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

  stopBoost = () => {
    if (this.boostIntervalId) {
      clearInterval(this.boostIntervalId);
      this.boostIntervalId = null;
    }
    if (this.boostTimeoutId) {
      clearTimeout(this.boostTimeoutId);
      this.boostTimeoutId = null;
    }
  };

  getRandomBoostType = (): BoostType => {
    const types = Object.values(BoostType);
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex];
  };

  getBoostDuration = (boostType: BoostType): number => {
    return (
      this.config.boostDurations[boostType] ||
      this.config.boostDurations.DEFAULT
    );
  };

  getBoostInterval = (boostType: BoostType): number => {
    return (
      this.config.boostIntervals[boostType] ||
      this.config.boostIntervals.DEFAULT
    );
  };

  getBoostMultiplier = (boostType: BoostType): number => {
    return (
      this.config.boostMultipliers[boostType] ||
      this.config.boostMultipliers.DEFAULT
    );
  };

  @computed
  get currentBoostType(): BoostType | null {
    return this.isBoosted ? this.boostType : null;
  }

  private saveDailyBoostTimestamp() {
    const now = Date.now();
    this.lastDailyBoostTimestamp = now;
  }

  private checkDailyBoostAvailability() {
    const lastBoostTimestamp = this.lastDailyBoostTimestamp;
    if (lastBoostTimestamp) {
      const now = Date.now();
      const timeSinceLastBoost = now - lastBoostTimestamp;
      const hoursSinceLastBoost =
        timeSinceLastBoost / this.config.dailyBoostCooldown;

      if (hoursSinceLastBoost >= 1) {
        this.canUseDailyBoost = true;
      } else {
        this.canUseDailyBoost = false;
      }
    } else {
      this.canUseDailyBoost = true;
    }
  }

  private startDailyBoostCooldown() {
    if (this.dailyBoostTimeoutId) {
      clearTimeout(this.dailyBoostTimeoutId);
    }

    this.dailyBoostTimeoutId = setTimeout(() => {
      runInAction(() => {
        this.canUseDailyBoost = true;
      });
    }, this.config.dailyBoostCooldown);
  }

  private startUpdateTimer() {
    setInterval(() => {
      if (!this.canUseDailyBoost && this.lastDailyBoostTimestamp) {
        const now = Date.now();
        const timeSinceLastBoost = now - this.lastDailyBoostTimestamp;
        const remainingTime =
          this.config.dailyBoostCooldown - timeSinceLastBoost;

        if (remainingTime > 0) {
          const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
          const seconds = Math.floor((remainingTime / 1000) % 60);

          this.timeUntilNextBoost = `${hours}:${minutes}:${seconds}`;
        } else {
          this.timeUntilNextBoost = '';
          this.canUseDailyBoost = true;
        }
      }
    }, this.config.updateInterval);
  }
}
