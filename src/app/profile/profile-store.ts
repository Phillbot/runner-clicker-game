import { injectable, inject } from 'inversify';
import {
  makeObservable,
  observable,
  action,
  runInAction,
  computed,
} from 'mobx';
import { BalanceStore } from '@app/balance/balance.store';
import { GameStore } from '@app/game/game.store';

@injectable()
export class ProfileStore {
  @observable private _lastBoostRun: number = 0;
  @observable private _boostDuration: number = 0; // Duration of the current boost in ms
  @observable private _boostIntervalId: NodeJS.Timeout | null = null;
  @observable private _timeUntilNextBoost: string = '';

  private readonly config = {
    boostCooldown: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    updateInterval: 1000, // 1 second
  };

  constructor(
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(GameStore) private readonly _gameStore: GameStore,
  ) {
    makeObservable(this);
    this.startUpdateTimer();
  }

  @computed
  get lastBoostRun(): number {
    return this._lastBoostRun;
  }

  @computed
  get timeUntilNextBoost(): string {
    return this._timeUntilNextBoost;
  }

  @computed
  get boostDuration(): number {
    return this._boostDuration;
  }

  @action
  setLastBoostRun(timestamp: number) {
    this._lastBoostRun = timestamp;
    this.updateBoostTime();
  }

  @action
  setBoostDuration(duration: number) {
    this._boostDuration = duration;
  }

  @action
  private updateBoostTime() {
    const now = Date.now();
    const timeSinceLastBoost = now - this._lastBoostRun;
    const remainingTime = this.config.boostCooldown - timeSinceLastBoost;

    if (remainingTime > 0) {
      const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);

      runInAction(() => {
        this._timeUntilNextBoost = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      });
    } else {
      runInAction(() => {
        this._timeUntilNextBoost = '00:00:00';
      });
    }
  }

  private startUpdateTimer() {
    setInterval(() => {
      this.updateBoostTime();
    }, this.config.updateInterval);
  }
}
