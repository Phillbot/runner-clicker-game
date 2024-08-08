import { injectable, inject } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';
import axios from 'axios';
import { BalanceStore } from '@app/balance/balance.store';
import {
  Abilities,
  getClickCostByLevel,
  ClickCostLevel,
  AbilityType,
} from './game-levels';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { EnvUtils } from '@utils/index';
import { ModalsStore } from '@app/modals/modals.store';

type ClickMessage = { id: number; x: number; y: number; removeAt: number };

@injectable()
export class GameStore {
  @observable
  private _clickMessages: ClickMessage[] = [];
  @observable
  private _isScaled: boolean = false;
  @observable
  private _clickCostLevel: ClickCostLevel = ClickCostLevel.LEVEL_1;

  private _clickId: number = 0;
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor(
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(EnergyStore) private readonly _energyStore: EnergyStore,
    @inject(ModalsStore) private readonly _modalsStore: ModalsStore,
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

  @action
  readonly handleEvent = (x: number, y: number) => {
    if (this.availableEnergyValue < this.clickCost) {
      this._energyStore.setEnergyAvailable(false);
      return;
    }

    const newClickId = this.generateClickMessageId();
    const removeAt = Date.now() + 500;

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
    this.setClickCostLevel(abilities.click_coast_level);
    this._energyStore.setEnergyTotalLevel(abilities.energy_level);
    this._energyStore.setEnergyRegenLevel(abilities.energy_regeniration_level);
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

  @action
  async incrementAbility(abilityType: AbilityType) {
    try {
      const initData = window.Telegram.WebApp.initData;
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/updateAbility`,
        { initData, abilityType },
      );

      if (response.data.ok) {
        runInAction(() => {
          const { balance, abilities } = response.data;
          this._balanceStore.setBalance(balance);
          this.setInitialData(balance, abilities);
        });

        this._modalsStore.closeLevelUpModal();
      } else {
        throw new Error('Failed to update ability');
      }
    } catch (error) {
      console.error('Error incrementing ability:', error);
    }
  }
}
