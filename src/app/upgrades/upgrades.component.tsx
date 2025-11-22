import { Component, ReactNode } from 'react';
import {
  AddCircleOutline,
  DoneAllOutlined,
  WalletOutlined,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import classNames from 'classnames';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import Tooltip from 'rc-tooltip';

import { BalanceStore } from '@app/balance/balance.store';
import BoostButtonWithNavigate from '@app/boost-button/boost-button.component';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { GameStore } from '@app/game/game.store';
import {
  AbilityType,
  ClickCostLevelMax,
  EnergyRegenLevelMax,
  EnergyValueLevelMax,
  getClickCostUpdateLevelCost,
  getEnergyRegenUpgradeLevelCost,
  getEnergyValueUpdateLevelCost,
} from '@app/game/game-levels';
import { ModalsStore } from '@app/modals/modals.store';
import { formatCompactNumber } from '@utils/number';

import { UpgradesStore } from './upgrades.store';

import styles from './upgrades.module.scss';

@observer
export class Upgrades extends Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;
  @resolve
  private declare readonly _upgradesStore: UpgradesStore;
  @resolve
  private declare readonly _gameStore: GameStore;
  @resolve
  private declare readonly _energyStore: EnergyStore;
  @resolve
  private declare readonly _balanceStore: BalanceStore;

  override render(): ReactNode {
    return (
      <div className={styles.upgrades}>
        <div className={styles.upgradesBoost}>
          <BoostButtonWithNavigate />
        </div>
        <div className={styles.upgradesBalanceInline}>
          Balance: {formatCompactNumber(this._balanceStore.balance)}
        </div>
        <div className={styles.upgradesBonusesContainer}>
          {this.abilities.map(
            ({ id, title, value, tooltip, isMaxLevel, nextLevelCoast }) => (
              <div key={id} className={styles.upgradesBonusesContainerItem}>
                <div className={styles.upgradesBonusesContainerItemBlock}>
                  {title}
                </div>

                <div
                  className={classNames(
                    styles.upgradesBonusesContainerItem,
                    styles.upgradesBonusesContainerItemBlockMiddle,
                  )}
                >
                  <Tooltip
                    destroyTooltipOnHide={true}
                    placement="top"
                    trigger={['hover']}
                    overlay={<span>{tooltip}</span>}
                  >
                    <span
                      className={
                        styles.upgradesBonusesContainerItemBlockLevelLabel
                      }
                    >
                      {value}
                    </span>
                  </Tooltip>
                </div>
                <div className={styles.upgradesBonusesContainerItem}>
                  {isMaxLevel ? (
                    <IconButton size="large" disableRipple>
                      <DoneAllOutlined />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="large"
                      color="primary"
                      onClick={() =>
                        this._modalStore.openLevelUpModal(id, nextLevelCoast)
                      }
                    >
                      <AddCircleOutline
                        className={styles.upgradesBonusesContainerItemBlockIcon}
                      />
                    </IconButton>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
        <div className={styles.upgradesWallet}>
          <Tooltip
            destroyTooltipOnHide={true}
            placement="top"
            trigger={['click']}
            overlay={<span>Soon</span>}
          >
            <WalletOutlined fontSize="large" />
          </Tooltip>
        </div>
      </div>
    );
  }

  private get abilities() {
    return [
      {
        id: AbilityType.ClickCost,
        title: 'Click level',
        value: `${this._gameStore.clickCostLevel}/${ClickCostLevelMax}`,
        tooltip: `Points per click - ${formatCompactNumber(this._gameStore.clickCost)} `,
        isMaxLevel: this._gameStore.clickCostLevel === ClickCostLevelMax,
        nextLevelCoast: getClickCostUpdateLevelCost(
          this._gameStore.clickCostLevel + 1,
        ),
      },
      {
        id: AbilityType.EnergyLimit,
        title: 'Energy level',
        value: `${this._energyStore.energyTotalLevel}/${EnergyValueLevelMax}`,
        tooltip: `Energy limit - ${formatCompactNumber(this._gameStore.energyTotalValue)}`,
        isMaxLevel: this._energyStore.energyTotalLevel === EnergyValueLevelMax,
        nextLevelCoast: getEnergyValueUpdateLevelCost(
          this._energyStore.energyTotalLevel + 1,
        ),
      },
      {
        id: AbilityType.EnergyRegen,
        title: 'Regen level',
        value: `${this._energyStore.energyRegenLevel}/${EnergyRegenLevelMax}`,
        tooltip: `Point regen per tic - ${formatCompactNumber(this._gameStore.energyRegenValue)}`,
        isMaxLevel: this._energyStore.energyRegenLevel === EnergyRegenLevelMax,
        nextLevelCoast: getEnergyRegenUpgradeLevelCost(
          this._energyStore.energyRegenLevel + 1,
        ),
      },
    ];
  }
}
