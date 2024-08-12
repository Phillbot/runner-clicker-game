import { injectable, inject } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';
import { BalanceStore } from '@app/balance/balance.store';
import { Abilities, getClickCostByLevel, ClickCostLevel } from './game-levels';
import { EnergyStore } from '@app/energy-bar/energy.store';

type ClickMessage = { id: number; x: number; y: number; removeAt: number };

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
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor(
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(EnergyStore) private readonly _energyStore: EnergyStore,
  ) {
    makeObservable(this);
    this._energyStore.startRegeneration();
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
  readonly handleEvent = (x: number, y: number) => {
    const now = Date.now();
    const precisionThreshold = 5;

    if (this._lastClickTimestamp) {
      const timeBetweenClicks = now - this._lastClickTimestamp;

      if (timeBetweenClicks < 60) {
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

      if (this._suspiciousClickCount > 5) {
        // this._isAutoClickerDetected = true;
        // this._telegram.showAlert('Auto-clicker detected!');
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
      const removeAt = now + 500;

      this.addClickMessage({ id: newClickId, x, y, removeAt });
      this._energyStore.decrementEnergy(this.clickCost);
      this._isScaled = true;
      this._energyStore.setEnergyAvailable(
        this.availableEnergyValue >= this.clickCost,
      );

      this._balanceStore.incrementBalance(this.clickCost);

      setTimeout(() => {
        runInAction(() => {
          this.removeClickMessage(newClickId);
        });
      }, 800);

      this.restartScaleAnimation();
      if (this._telegram) {
        this._telegram.HapticFeedback.impactOccurred('heavy');
      }
    }
  };

  @action
  readonly restartScaleAnimation = () => {
    this.setScaled(false);
    setTimeout(() => {
      runInAction(() => {
        this.setScaled(true);
        setTimeout(() => {
          this.setScaled(false);
        }, 100);
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
  readonly setInitialData = (balance: number, abilities: Abilities) => {
    this._balanceStore.setBalance(balance);
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
