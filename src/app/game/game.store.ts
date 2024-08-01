import { injectable } from 'inversify';
import { observable, action, computed, makeObservable } from 'mobx';

type ClickMessage = { id: number; x: number; y: number; removeAt: number };

@injectable()
export class GameStore {
  @observable clickMessages: ClickMessage[] = [];
  @observable scaleValue: number = 5000;
  @observable isScaled: boolean = false;
  private clickId: number = 0;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    makeObservable(this);
    this.startRegeneration();
  }

  @action
  handleEvent = (x: number, y: number) => {
    const newClickId = this.clickId++;
    const removeAt = Date.now() + 500;

    this.clickMessages.push({ id: newClickId, x, y, removeAt });
    this.scaleValue = Math.max(this.scaleValue - 100, 0);
    this.isScaled = true;

    setTimeout(() => {
      this.removeClickMessage(newClickId);
    }, 500);

    this.restartScaleAnimation();
  };

  @action
  regeneratePoints = () => {
    this.scaleValue = Math.min(this.scaleValue + 5, 5000);
    this.removeOldMessages();
  };

  startRegeneration = () => {
    console.log('HERE');
    this.intervalId = setInterval(() => {
      this.regeneratePoints();
    }, 1000);
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
      this.setScaled(true);
      setTimeout(() => {
        this.setScaled(false);
      }, 100);
    }, 0);
  };

  @action
  removeClickMessage = (id: number) => {
    this.clickMessages = this.clickMessages.filter(click => click.id !== id);
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

  @computed
  get activeClickMessages() {
    const now = Date.now();
    return this.clickMessages.filter(click => click.removeAt > now);
  }
}
