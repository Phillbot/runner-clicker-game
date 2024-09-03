import { inject, injectable } from 'inversify';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import axios from 'axios';
import { toast } from 'react-toastify';

import { formatNumber, generateAuthTokenHeaders } from '@utils/common';
import { EnvUtils } from '@utils/env';

import { EnergyStore } from '@app/energy-bar/energy.store';
import {
  AbilityType,
  ClickCostLevelMax,
  EnergyRegenLevelMax,
  EnergyValueLevelMax,
  getClickCostUpdateLevelCost,
  getEnergyValueUpdateLevelCost,
  getEnergyRegenUpgradeLevelCost,
} from '@app/game/game-levels';
import { GameStore } from '@app/game/game.store';
import { BalanceStore } from '@app/balance/balance.store';
import { ModalsStore } from '@app/modals/modals.store';
import { LoadingOverlayStore } from '@app/loading-overlay/loading-overlay.store';
import { toastConfig } from '@config/toast.config';

@injectable()
export class UpgradesStore {
  @observable
  private _abilities: {
    id: AbilityType;
    title: string;
    value: string;
    tooltip: string;
    isMaxLevel: boolean;
    nextLevelCoast: number | undefined;
  }[] = [];

  @observable
  private _userId: number | string = 0;

  private readonly _telegram = window.Telegram.WebApp;

  constructor(
    @inject(EnergyStore) private readonly _energyStore: EnergyStore,
    @inject(GameStore) private readonly _gameStore: GameStore,
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(ModalsStore) private readonly _modalsStore: ModalsStore,
    @inject(LoadingOverlayStore)
    private readonly _loadingOverlayStore: LoadingOverlayStore,
  ) {
    makeObservable(this);
    this.updateAbilities();
  }

  @computed.struct
  get abilities() {
    return this._abilities;
  }

  @computed
  get userId(): number | string {
    return this._userId;
  }

  @action
  updateAbilities() {
    this._abilities = [
      {
        id: AbilityType.ClickCost,
        title: 'Click level',
        value: `${this._gameStore.clickCostLevel}/${ClickCostLevelMax}`,
        tooltip: `Points per click - ${formatNumber(this._gameStore.clickCost)} `,
        isMaxLevel: this._gameStore.clickCostLevel === ClickCostLevelMax,
        nextLevelCoast: getClickCostUpdateLevelCost(
          this._gameStore.clickCostLevel + 1,
        ),
      },
      {
        id: AbilityType.EnergyLimit,
        title: 'Energy level',
        value: `${this._energyStore.energyTotalLevel}/${EnergyValueLevelMax}`,
        tooltip: `Energy limit - ${formatNumber(this._gameStore.energyTotalValue)}`,
        isMaxLevel: this._energyStore.energyTotalLevel === EnergyValueLevelMax,
        nextLevelCoast: getEnergyValueUpdateLevelCost(
          this._energyStore.energyTotalLevel + 1,
        ),
      },
      {
        id: AbilityType.EnergyRegen,
        title: 'Regen level',
        value: `${this._energyStore.energyRegenLevel}/${EnergyRegenLevelMax}`,
        tooltip: `Point regen per tic - ${formatNumber(this._gameStore.energyRegenValue)}`,
        isMaxLevel: this._energyStore.energyRegenLevel === EnergyRegenLevelMax,
        nextLevelCoast: getEnergyRegenUpgradeLevelCost(
          this._energyStore.energyRegenLevel + 1,
        ),
      },
    ];
  }

  @action
  async incrementAbility(abilityType: AbilityType) {
    try {
      this._loadingOverlayStore.setIsLoading(true);

      await this._balanceStore.syncWithServer();

      const initData = this._telegram.initData;
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/update-ability`,
        { initData, abilityType },
        {
          headers: { ...generateAuthTokenHeaders() },
        },
      );

      if (response.data.ok) {
        runInAction(() => {
          const { balance, abilities, activeEnergy } = response.data;
          this._balanceStore.setBalance(balance);

          activeEnergy > 0 &&
            this._energyStore.setAvailableEnergyValue(activeEnergy);

          this._gameStore.setInitialData(abilities);
          this.updateAbilities();

          toast.success('Ability upgraded successfully!', toastConfig);
        });

        this._modalsStore.closeLevelUpModal();
      } else {
        if (this._telegram) {
          this._telegram.close();
        }
        throw new Error('Failed to update ability');
      }
    } catch (error) {
      console.error('Error incrementing ability:', error);

      toast.error('Failed to upgrade ability. Please try again.', toastConfig);
    } finally {
      this._loadingOverlayStore.setIsLoading(false);
    }
  }

  @action
  setUserId(value: string | number): void {
    this._userId = value;
  }
}
