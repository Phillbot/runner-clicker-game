import { injectable } from 'inversify';
import {
  observable,
  action,
  computed,
  makeObservable,
  runInAction,
} from 'mobx';

type ClickMessage = { id: number; x: number; y: number; removeAt: number };

@injectable()
export class GameStore {
  @observable clickMessages: ClickMessage[] = [];
  @observable scaleValue: number = 1000;
  @observable isScaled: boolean = false;
  @observable isClickable: boolean = true;
  @observable balance: number = 1000;
  @observable isBoosted: boolean = false;
  @observable showBoostButton: boolean = false;

  private clickId: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private boostIntervalId: NodeJS.Timeout | null = null;
  private boostTimeoutId: NodeJS.Timeout | null = null;
  private readonly _initScaleValue: number = 1000;
  private readonly _clickCost: number = 10;
  private readonly regenirationSpeed: number = 500;
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor() {
    makeObservable(this);
    this.startRegeneration();
    this.scheduleNextBoostButton();
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
  toggleBoosted = () => {
    if (!this.isBoosted) {
      this.isBoosted = true;
      this.showBoostButton = false;
      this.startBoost();

      const randomBoostDuration = Math.random() * (50000 - 5000) + 5000; // random duration between 5 and 50 seconds
      this.boostTimeoutId = setTimeout(() => {
        runInAction(() => {
          this.stopBoost();
          this.isBoosted = false;
        });
      }, randomBoostDuration);
    }
  };

  startBoost = () => {
    if (!this.boostIntervalId) {
      this.boostIntervalId = setInterval(() => {
        runInAction(() => {
          this.balance += this._clickCost * 10;
          const newClickId = this.clickId++;
          const removeAt = Date.now() + 500;
          this.clickMessages.push({ id: newClickId, x: 0, y: 0, removeAt });

          setTimeout(() => {
            runInAction(() => {
              this.clickMessages = this.clickMessages.filter(
                click => click.id !== newClickId,
              );
            });
          }, 500);
        });
      }, 1000);
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

  scheduleNextBoostButton = () => {
    const randomInterval = Math.random() * (50000 - 5000) + 5000; // random time between 5 and 50 seconds

    setTimeout(() => {
      if (!this.isBoosted) {
        runInAction(() => {
          this.showBoostButton = true;
        });

        setTimeout(() => {
          runInAction(() => {
            this.showBoostButton = false;
            this.scheduleNextBoostButton(); // Schedule the next boost button after the current one disappears
          });
        }, 3000); // show button for 3 seconds
      }
    }, randomInterval);
  };

  @computed
  get activeClickMessages() {
    const now = Date.now();
    return this.clickMessages.filter(click => click.removeAt > now);
  }
}
