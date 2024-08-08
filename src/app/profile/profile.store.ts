import { inject, injectable } from 'inversify';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import axios from 'axios';

import { formatNumber } from '@utils/common';
import { EnvUtils } from '@utils/env';

import { EnergyStore } from '@app/energy-bar/energy.store';
import {
  AbilityType,
  ClickCostLevelMax,
  clickCostUpdateLevelCost,
  EnergyRegenLevelMax,
  energyRegenValueUpdateLevelCost,
  EnergyValueLevelMax,
  energyValueUpdateLevelCost,
} from '@app/game/game-levels';
import { GameStore } from '@app/game/game.store';
import { BalanceStore } from '@app/balance/balance.store';
import { ModalsStore } from '@app/modals/modals.store';
import { LoadingOverlayStore } from '@app/loading-overlay/loading-overlay.store';

@injectable()
export class ProfileStore {
  @observable
  private _abilities: {
    id: AbilityType;
    title: string;
    value: string;
    tooltip: string;
    isMaxLevel: boolean;
    nextLevelCoast: number | undefined;
  }[] = [];

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

  @action
  updateAbilities() {
    this._abilities = [
      {
        id: AbilityType.ClickCost,
        title: 'Click level',
        value: `${this._gameStore.clickCostLevel}/${ClickCostLevelMax}`,
        tooltip: `Points per click - ${formatNumber(this._gameStore.clickCost)} `,
        isMaxLevel: this._gameStore.clickCostLevel === ClickCostLevelMax,
        nextLevelCoast: clickCostUpdateLevelCost.get(
          this._gameStore.clickCostLevel + 1,
        ),
      },
      {
        id: AbilityType.EnergyLimit,
        title: 'Energy level',
        value: `${this._energyStore.energyTotalLevel}/${EnergyValueLevelMax}`,
        tooltip: `Energy limit - ${formatNumber(this._gameStore.energyTotalValue)}`,
        isMaxLevel: this._energyStore.energyTotalLevel === EnergyValueLevelMax,
        nextLevelCoast: energyValueUpdateLevelCost.get(
          this._energyStore.energyTotalLevel + 1,
        ),
      },
      {
        id: AbilityType.EnergyRegen,
        title: 'Regen level',
        value: `${this._energyStore.energyRegenLevel}/${EnergyRegenLevelMax}`,
        tooltip: `Point regen per tic - ${formatNumber(this._gameStore.energyRegenValue)}`,
        isMaxLevel: this._energyStore.energyRegenLevel === EnergyRegenLevelMax,
        nextLevelCoast: energyRegenValueUpdateLevelCost.get(
          this._energyStore.energyRegenLevel + 1,
        ),
      },
    ];
  }

  @action
  async incrementAbility(abilityType: AbilityType) {
    try {
      this._loadingOverlayStore.setIsLoading(true);

      const initData = this._telegram.initData;
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/updateAbility`,
        { initData, abilityType },
      );

      if (response.data.ok) {
        runInAction(() => {
          const { balance, abilities } = response.data;
          this._balanceStore.setBalance(balance);
          this._gameStore.setInitialData(balance, abilities);
          this.updateAbilities();
        });

        this._modalsStore.closeLevelUpModal();
        this._loadingOverlayStore.setIsLoading(false);
      } else {
        if (this._telegram) {
          this._telegram.close();
        }
        throw new Error('Failed to update ability');
      }
    } catch (error) {
      this._loadingOverlayStore.setIsLoading(false);
      console.error('Error incrementing ability:', error);
    }
  }
}
