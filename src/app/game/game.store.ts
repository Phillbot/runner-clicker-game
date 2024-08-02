import { injectable } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';

type ClickMessage = { id: number; x: number; y: number; removeAt: number };

@injectable()
export class GameStore {
  @observable clickMessages: ClickMessage[] = [];
  @observable scaleValue: number = 1000;
  @observable isScaled: boolean = false;
  @observable isClickable: boolean = true;
  @observable balance: number = 1000;

  private clickId: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly _initScaleValue: number = 1000;
  private readonly regenirationSpeed: number = 500;
  private readonly _telegram: WebApp = window.Telegram.WebApp;
  private readonly _clickCost: number = 10;

  constructor() {
    makeObservable(this);
    this.startRegeneration();
  }

  get clickCost(): number {
    return this._clickCost;
  }

  get initScaleValue(): number {
    return this._initScaleValue;
  }

  @action
  handleEvent = (x: number, y: number) => {
    if (this.scaleValue < this._clickCost) {
      this.setClickable(false);
      return;
    }

    const newClickId = this.clickId++;
    const removeAt = Date.now() + 500;

    this.clickMessages.push({ id: newClickId, x, y, removeAt });
    this.scaleValue = Math.max(this.scaleValue - this._clickCost, 0);
    this.isScaled = true;
    this.setClickable(this.scaleValue >= this._clickCost);

    this.incrementBalance(this._clickCost);

    setTimeout(() => {
      runInAction(() => {
        this.clickMessages = this.clickMessages.filter(
          click => click.id !== newClickId,
        );
      });
    }, 800);

    this.restartScaleAnimation();
    this._telegram.HapticFeedback.impactOccurred('heavy');
  };

  @action
  regeneratePoints = () => {
    this.scaleValue = Math.min(this.scaleValue + 1, this._initScaleValue);
    this.setClickable(this.scaleValue >= this._clickCost);
    this.removeOldMessages();
  };

  startRegeneration = () => {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        runInAction(() => {
          this.regeneratePoints();
        });
      }, this.regenirationSpeed);
    }
  };

  stopRegeneration = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };

  @action
  restartScaleAnimation = () => {
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
  removeOldMessages = () => {
    const now = Date.now();
    this.clickMessages = this.clickMessages.filter(
      click => click.removeAt > now,
    );
  };

  @action
  setScaled = (value: boolean) => {
    this.isScaled = value;
  };

  @action
  setClickable = (value: boolean) => {
    this.isClickable = value;
  };

  @action
  incrementBalance = (amount: number) => {
    this.balance += amount;
  };

  @action
  generateClickMessageId = (): number => {
    return this.clickId++;
  };

  @action
  addClickMessage = (message: ClickMessage) => {
    this.clickMessages.push(message);
  };

  @action
  removeClickMessage = (id: number) => {
    this.clickMessages = this.clickMessages.filter(click => click.id !== id);
  };

  @computed
  get activeClickMessages() {
    const now = Date.now();
    return this.clickMessages.filter(click => click.removeAt > now);
  }
}
