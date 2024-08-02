import { inject, injectable } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';
import { GameStore } from '@app/game/game.store';

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
  private updateTimerIntervalId: NodeJS.Timeout | null = null;

  constructor(@inject(GameStore) private readonly _gameStore: GameStore) {
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
          this._gameStore.incrementBalance(
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
    switch (boostType) {
      case BoostType.Mega:
        return 60000; // 1 minute
      case BoostType.Normal:
        return 30000; // 30 seconds
      case BoostType.Tiny:
        return 15000; // 15 seconds
      default:
        return 30000;
    }
  };

  getBoostInterval = (boostType: BoostType): number => {
    switch (boostType) {
      case BoostType.Mega:
        return 500; // 500 ms
      case BoostType.Normal:
        return 1000; // 1 second
      case BoostType.Tiny:
        return 1000; // 1 second
      default:
        return 1000;
    }
  };

  getBoostMultiplier = (boostType: BoostType): number => {
    switch (boostType) {
      case BoostType.Mega:
        return 20;
      case BoostType.Normal:
        return 10;
      case BoostType.Tiny:
        return 5;
      default:
        return 1;
    }
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
      const hoursSinceLastBoost = timeSinceLastBoost / (1000 * 60 * 60);

      if (hoursSinceLastBoost >= 24) {
        this.canUseDailyBoost = true;
      } else {
        this.canUseDailyBoost = false;
        this.startDailyBoostCooldown();
      }
    } else {
      this.canUseDailyBoost = true;
    }
  }

  private startDailyBoostCooldown() {
    if (this.dailyBoostTimeoutId) {
      clearTimeout(this.dailyBoostTimeoutId);
    }

    this.dailyBoostTimeoutId = setTimeout(
      () => {
        runInAction(() => {
          this.canUseDailyBoost = true;
        });
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours
  }

  private startUpdateTimer() {
    this.updateTimerIntervalId = setInterval(() => {
      if (!this.canUseDailyBoost && this.lastDailyBoostTimestamp) {
        const now = Date.now();
        const timeSinceLastBoost = now - this.lastDailyBoostTimestamp;
        const remainingTime = 24 * 60 * 60 * 1000 - timeSinceLastBoost;

        if (remainingTime > 0) {
          const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
          const seconds = Math.floor((remainingTime / 1000) % 60);

          this.timeUntilNextBoost = `${hours}h ${minutes}m ${seconds}s`;
        } else {
          this.timeUntilNextBoost = '';
          this.canUseDailyBoost = true;
        }
      }
    }, 1000);
  }
}
