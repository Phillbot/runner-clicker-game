import { BalanceStore } from '@app/balance/balance.store';
import { injectable, inject } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';
import {
  EnergyValueLevel,
  ClickCostLevel,
  EnergyRegenLevel,
  getEnergyValueByLevel,
  getClickCostByLevel,
  getEnergyRegenValueByLevel,
} from './game-levels';

type ClickMessage = { id: number; x: number; y: number; removeAt: number };

@injectable()
export class GameStore {
  @observable private _clickMessages: ClickMessage[] = [];
  @observable private _isScaled: boolean = false;
  @observable private _isEnergyAvailable: boolean = true;

  @observable private _availableEnergyValue: number = getEnergyValueByLevel(
    EnergyValueLevel.LEVEL_1, // its same as this._energyTotalLevel
  );

  @observable private _clickCostLevel: ClickCostLevel = ClickCostLevel.LEVEL_20;
  @observable private _energyTotalLevel: EnergyValueLevel =
    EnergyValueLevel.LEVEL_1;
  @observable private _energyRegenLevel: EnergyRegenLevel =
    EnergyRegenLevel.LEVEL_5;

  private _clickId: number = 0;
  private _intervalId: NodeJS.Timeout | null = null;
  private readonly _regenerationSpeed: number = 100;
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor(
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
  ) {
    makeObservable(this);
    this.startRegeneration();
  }

  @computed
  get clickCost(): number {
    return getClickCostByLevel(this._clickCostLevel);
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
  get clickMessages(): ClickMessage[] {
    return this._clickMessages;
  }

  @computed
  get availableEnergyValue(): number {
    return this._availableEnergyValue;
  }

  @computed
  get isScaled(): boolean {
    return this._isScaled;
  }

  @computed
  get isEnergyAvailable(): boolean {
    return this._isEnergyAvailable;
  }

  @computed
  get clickCostLevel(): ClickCostLevel {
    return this._clickCostLevel;
  }

  @computed
  get energyTotalLevel(): EnergyValueLevel {
    return this._energyTotalLevel;
  }

  @computed
  get energyRegenLevel(): EnergyRegenLevel {
    return this._energyRegenLevel;
  }

  @computed
  get activeClickMessages(): ClickMessage[] {
    const now = Date.now();
    return this._clickMessages.filter(click => click.removeAt > now);
  }

  @action
  readonly handleEvent = (x: number, y: number) => {
    if (this._availableEnergyValue < this.clickCost) {
      this.setEnergyAvailable(false);
      return;
    }

    const newClickId = this._clickId++;
    const removeAt = Date.now() + 500;

    this._clickMessages.push({ id: newClickId, x, y, removeAt });
    this._availableEnergyValue = Math.max(
      this._availableEnergyValue - this.clickCost,
      0,
    );
    this._isScaled = true;
    this.setEnergyAvailable(this._availableEnergyValue >= this.clickCost);

    this._balanceStore.incrementBalance(this.clickCost);

    setTimeout(() => {
      runInAction(() => {
        this._clickMessages = this._clickMessages.filter(
          click => click.id !== newClickId,
        );
      });
    }, 800);

    this.restartScaleAnimation();
    if (this._telegram) {
      this._telegram.HapticFeedback.impactOccurred('heavy');
    }
  };

  @action
  readonly regeneratePoints = () => {
    this._availableEnergyValue = Math.min(
      this._availableEnergyValue + this.energyRegenValue,
      this.energyTotalValue,
    );
    this.setEnergyAvailable(this._availableEnergyValue >= this.clickCost);
    this.removeOldMessages();
  };

  readonly startRegeneration = () => {
    if (!this._intervalId) {
      this._intervalId = setInterval(() => {
        runInAction(() => {
          this.regeneratePoints();
        });
      }, this._regenerationSpeed);
    }
  };

  readonly stopRegeneration = () => {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
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
  readonly removeOldMessages = () => {
    const now = Date.now();
    this._clickMessages = this._clickMessages.filter(
      click => click.removeAt > now,
    );
  };

  @action
  readonly setScaled = (value: boolean) => {
    this._isScaled = value;
  };

  @action
  readonly setEnergyAvailable = (value: boolean) => {
    this._isEnergyAvailable = value;
  };

  @action
  readonly generateClickMessageId = (): number => {
    return this._clickId++;
  };

  @action
  readonly addClickMessage = (message: ClickMessage) => {
    this._clickMessages.push(message);
  };

  @action
  readonly removeClickMessage = (id: number) => {
    this._clickMessages = this._clickMessages.filter(click => click.id !== id);
  };
}
