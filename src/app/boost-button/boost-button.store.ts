import { inject, injectable } from 'inversify';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import { ApiClient } from '@app/common/api-client';
import { Scheduler } from '@app/common/scheduler';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { TelegramService } from '@app/entry/services/telegram.service';
import { GameStore } from '@app/game/game.store';
import { EnvUtils } from '@utils';

export enum BoostType {
  Mega = 'MEGA',
  Normal = 'NORMAL',
  Tiny = 'TINY',
}

type SyncBoostResponse = Readonly<{
  ok: boolean;
}>;

interface BoostConfig {
  boostMultipliers: Record<BoostType | 'DEFAULT', number>;
  boostDurations: Record<BoostType | 'DEFAULT', number>;
  boostIntervals: Record<BoostType | 'DEFAULT', number>;
  cooldown: number;
  updateInterval: number;
}

@injectable()
export class BoostStore {
  @observable
  private _boostType: BoostType | null = null;
  @observable
  private _lastBoostRun: number = 0;
  @observable
  private _isCooldownActive: boolean = false;
  @observable
  private _lastBoostTime: number | null = null;
  @observable
  private _isTooltipVisible: boolean = false;
  @observable
  private _cooldownMs: number = 0;

  private _boostTimeoutId: number | null = null;
  private _boostIntervalId: number | null = null;
  private _cooldownIntervalId: number | null = null;

  constructor(
    @inject(EnergyStore) private readonly energyStore: EnergyStore,
    @inject(GameStore) private readonly _gameStore: GameStore,
    @inject(ApiClient) private readonly _apiClient: ApiClient,
    @inject(TelegramService)
    private readonly _telegramService: TelegramService,
    @inject(Scheduler) private readonly _scheduler: Scheduler,
  ) {
    makeObservable(this);
  }

  get config(): BoostConfig {
    return {
      boostMultipliers: {
        DEFAULT: 1,
        [BoostType.Mega]: 20,
        [BoostType.Normal]: 10,
        [BoostType.Tiny]: 5,
      },
      boostDurations: {
        DEFAULT: EnvUtils.enableMock ? 10000 : 60000,
        [BoostType.Mega]: EnvUtils.enableMock ? 10000 : 60000,
        [BoostType.Normal]: EnvUtils.enableMock ? 8000 : 30000,
        [BoostType.Tiny]: EnvUtils.enableMock ? 5000 : 15000,
      },
      boostIntervals: {
        DEFAULT: 1000,
        [BoostType.Mega]: 500,
        [BoostType.Normal]: 1000,
        [BoostType.Tiny]: 1000,
      },
      cooldown: EnvUtils.enableMock ? 15000 : 21600000,
      updateInterval: 3000,
    };
  }

  @computed
  get boostType(): BoostType | null {
    return this._boostType;
  }

  @computed
  get isBoosted(): boolean {
    return this._boostType !== null;
  }

  @computed
  get boostMultiplier(): number {
    return this._boostType ? this.getBoostMultiplier(this._boostType) : 1;
  }

  @computed
  get canUseDailyBoost(): boolean {
    return !this._isCooldownActive;
  }

  @computed
  get timeUntilNextBoost(): string {
    const ms = this.remainingCooldown;
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  @computed
  get isTooltipVisible(): boolean {
    return this._isTooltipVisible;
  }

  @computed
  get remainingCooldown(): number {
    return this._cooldownMs;
  }

  @action
  setBoostType(boostType: BoostType | null) {
    this._boostType = boostType;
  }

  @action
  setInitialBoostData(lastBoostRun: number) {
    this._lastBoostRun = lastBoostRun;
    const remaining = this.getRemainingFromLastRun();
    this._cooldownMs = remaining;
    this._isCooldownActive = remaining > 0;
    if (remaining > 0) {
      this._lastBoostTime = Date.now() - (this.config.cooldown - remaining);
      this.startCooldownTimer();
    }
  }

  private getBoostMultiplier(boostType: BoostType): number {
    return (
      this.config.boostMultipliers[boostType] ||
      this.config.boostMultipliers.DEFAULT
    );
  }

  @action
  private async syncBoostData() {
    try {
      const response = await this._apiClient.post<SyncBoostResponse>(
        EnvUtils.apiEndpoints.updateBoost,
        {
          initData: this._telegramService.initData,
          lastBoostRun: this._lastBoostRun,
        },
      );

      if (!response.ok) {
        this._telegramService.close();
        throw new Error('Failed to sync boost data');
      }
    } catch (error) {
      console.error('Failed to sync boost data', error);
    }
  }

  @action
  startBoost(boostType: BoostType) {
    if (this._isCooldownActive) {
      return;
    }

    runInAction(() => {
      this._boostType = boostType;
      this._lastBoostTime = Date.now();
      this._lastBoostRun = Date.now();
      this._cooldownMs = this.config.cooldown;
      this.energyStore.setEnergyAvailable(true);
    });

    this._boostTimeoutId = this._scheduler.setTimeout(() => {
      this.stopBoost();
    }, this.getBoostDuration(boostType));

    // Auto-click while boost is active.
    this._boostIntervalId = this._scheduler.setInterval(() => {
      this.energyStore.setAvailableEnergyValue(
        this.energyStore.energyTotalValue,
      );
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      this._gameStore.handleEvent(randomX, randomY, this.boostMultiplier);
    }, this.getBoostInterval(boostType));

    this._isCooldownActive = true;
    if (!EnvUtils.enableMock) {
      this.syncBoostData();
    }

    this.startCooldownTimer();
  }

  @action
  stopBoost() {
    this.setBoostType(null);
    if (this._boostIntervalId) {
      this._scheduler.clearInterval(this._boostIntervalId);
      this._boostIntervalId = null;
    }
    if (this._boostTimeoutId) {
      this._scheduler.clearTimeout(this._boostTimeoutId);
      this._boostTimeoutId = null;
    }
    this.startCooldownTimer();
  }

  @action
  useDailyBoost() {
    this.startBoost(this.getRandomBoostType());
  }

  @action
  setTooltipVisible(visible: boolean) {
    this._isTooltipVisible = visible;
  }

  private getRandomBoostType(): BoostType {
    const types: BoostType[] = [
      BoostType.Mega,
      BoostType.Normal,
      BoostType.Tiny,
    ];
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex];
  }

  private startCooldownTimer() {
    if (this._cooldownIntervalId) {
      this._scheduler.clearInterval(this._cooldownIntervalId);
    }

    if (!this._isCooldownActive || !this._lastBoostTime) {
      runInAction(() => {
        this._cooldownMs = 0;
      });
      return;
    }

    this._cooldownIntervalId = this._scheduler.setInterval(() => {
      if (!this._isCooldownActive || !this._lastBoostTime) {
        runInAction(() => {
          this._cooldownMs = 0;
        });
        this._scheduler.clearInterval(this._cooldownIntervalId!);
        this._cooldownIntervalId = null;
        return;
      }

      const elapsed = Date.now() - this._lastBoostTime;
      const remaining = Math.max(0, this.config.cooldown - elapsed);
      runInAction(() => {
        this._cooldownMs = remaining;
      });

      if (remaining === 0) {
        runInAction(() => {
          this._isCooldownActive = false;
          this._lastBoostTime = null;
        });
        this._scheduler.clearInterval(this._cooldownIntervalId!);
        this._cooldownIntervalId = null;
      }
    }, 1000);
  }

  private getBoostDuration(boostType: BoostType): number {
    return (
      this.config.boostDurations[boostType] ??
      this.config.boostDurations.DEFAULT
    );
  }

  private getBoostInterval(boostType: BoostType): number {
    return (
      this.config.boostIntervals[boostType] ??
      this.config.boostIntervals.DEFAULT
    );
  }

  private getRemainingFromLastRun(): number {
    if (!this._lastBoostRun) {
      return 0;
    }
    const elapsed = Date.now() - this._lastBoostRun;
    return Math.max(0, this.config.cooldown - elapsed);
  }
}
