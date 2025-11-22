import { inject, injectable } from 'inversify';
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';

import { BalanceStore } from '@app/balance/balance.store';
import { Scheduler } from '@app/common/scheduler';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { TelegramService } from '@app/entry/services/telegram.service';
import { GAME_CONSTANTS } from '@config/game.constants';

import { Abilities, ClickCostLevel, getClickCostByLevel } from './game-levels';

type ClickMessage = Readonly<{
  id: number;
  x: number;
  y: number;
  removeAt: number;
}>;

@injectable()
export class GameStore {
  @observable
  private _clickMessages: ClickMessage[] = [];
  @observable
  private _isScaled: boolean = false;
  @observable
  private _clickCostLevel: ClickCostLevel = ClickCostLevel.LEVEL_1;
  @observable
  private _lastClickTimestamp: number | null = null;
  @observable
  private _lastClickX: number | null = null;
  @observable
  private _lastClickY: number | null = null;
  @observable
  private _suspiciousClickCount: number = 0;
  @observable
  private _isAutoClickerDetected: boolean = false;

  private _clickId: number = 0;
  private readonly _telegram: WebApp | undefined;

  constructor(
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(EnergyStore) private readonly _energyStore: EnergyStore,
    @inject(TelegramService)
    private readonly _telegramService: TelegramService,
    @inject(Scheduler) private readonly _scheduler: Scheduler,
  ) {
    makeObservable(this);
    this._telegram = this._telegramService.webApp;
    reaction(
      () => this.availableEnergyValue >= this.clickCost,
      isEnergyAvailable => {
        this._energyStore.setEnergyAvailable(isEnergyAvailable);
      },
    );
  }

  @computed
  get clickCost(): number {
    return getClickCostByLevel(this._clickCostLevel);
  }

  @computed
  get energyTotalValue(): number {
    return this._energyStore.energyTotalValue;
  }

  @computed
  get energyRegenValue(): number {
    return this._energyStore.energyRegenValue;
  }

  @computed
  get availableEnergyValue(): number {
    return this._energyStore.availableEnergyValue;
  }

  @computed
  get clickMessages(): ClickMessage[] {
    return this._clickMessages;
  }

  @computed
  get isScaled(): boolean {
    return this._isScaled;
  }

  @computed
  get isEnergyAvailable(): boolean {
    return this._energyStore.isEnergyAvailable;
  }

  @computed
  get clickCostLevel(): ClickCostLevel {
    return this._clickCostLevel;
  }

  @computed
  get activeClickMessages(): ClickMessage[] {
    const now = Date.now();
    return this._clickMessages.filter(click => click.removeAt > now);
  }

  @computed
  get isAutoClickerDetected(): boolean {
    return this._isAutoClickerDetected;
  }

  @action
  readonly handleEvent = (x: number, y: number, multiplier: number = 1) => {
    const now = Date.now();
    const precisionThreshold = GAME_CONSTANTS.CLICK_PRECISION_THRESHOLD;

    if (this._lastClickTimestamp) {
      const timeBetweenClicks = now - this._lastClickTimestamp;

      if (timeBetweenClicks < GAME_CONSTANTS.CLICK_DEBOUNCE_MS) {
        if (
          this._lastClickX !== null &&
          this._lastClickY !== null &&
          Math.abs(this._lastClickX - x) <= precisionThreshold &&
          Math.abs(this._lastClickY - y) <= precisionThreshold
        ) {
          this._suspiciousClickCount++;
        } else {
          this._suspiciousClickCount = 0;
        }
      } else {
        this._suspiciousClickCount = 0;
      }

      if (
        this._suspiciousClickCount > GAME_CONSTANTS.SUSPICIOUS_CLICK_THRESHOLD
      ) {
        // this._isAutoClickerDetected = true;
        this._telegram.showAlert('Auto-clicker detected! (Beta)');
      }
    }

    this._lastClickTimestamp = now;
    this._lastClickX = x;
    this._lastClickY = y;

    if (
      !this._isAutoClickerDetected &&
      this.availableEnergyValue >= this.clickCost
    ) {
      const newClickId = this.generateClickMessageId();
      const removeAt = now + GAME_CONSTANTS.CLICK_MESSAGE_LIFETIME_MS;

      this.addClickMessage({ id: newClickId, x, y, removeAt });
      this._energyStore.decrementEnergy(this.clickCost);
      this._isScaled = true;

      this._balanceStore.incrementBalance(this.clickCost * multiplier);

      this._scheduler.setTimeout(() => {
        runInAction(() => {
          this.removeClickMessage(newClickId);
        });
      }, GAME_CONSTANTS.CLICK_MESSAGE_REMOVE_DELAY_MS);

      this.restartScaleAnimation();
      if (this._telegram) {
        this._telegram.HapticFeedback.impactOccurred('heavy');
      }
    }
  };

  @action
  readonly restartScaleAnimation = () => {
    this.setScaled(false);
    this._scheduler.setTimeout(() => {
      runInAction(() => {
        this.setScaled(true);
        this._scheduler.setTimeout(() => {
          this.setScaled(false);
        }, GAME_CONSTANTS.SCALE_ANIMATION_DURATION_MS);
      });
    }, 0);
  };

  @action
  readonly setScaled = (value: boolean) => {
    this._isScaled = value;
  };

  @action
  readonly removeOldMessages = () => {
    const now = Date.now();
    this._clickMessages = this._clickMessages.filter(
      click => click.removeAt > now,
    );
  };

  @action
  setClickCostLevel = (level: ClickCostLevel) => {
    this._clickCostLevel = level;
  };

  @action
  readonly setInitialData = (abilities: Abilities) => {
    this.setClickCostLevel(abilities.clickCoastLevel);
    this._energyStore.setEnergyTotalLevel(abilities.energyLevel);
    this._energyStore.setEnergyRegenLevel(abilities.energyRegenirationLevel);
  };

  @action
  generateClickMessageId(): number {
    return this._clickId++;
  }

  @action
  addClickMessage(message: ClickMessage) {
    this._clickMessages.push(message);
  }

  @action
  removeClickMessage(id: number) {
    this._clickMessages = this._clickMessages.filter(click => click.id !== id);
  }
}
