import React, { Component, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';
import Tooltip from 'rc-tooltip';

import {
  AddCircleOutline,
  DoneAllOutlined,
  WalletOutlined,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

import { ModalsStore } from '@app/modals/modals.store';
import BoostButtonWithNavigate from '@app/boost-button/boost-button.component';

import { UpgradesStore } from './upgrades.store';

import styles from './upgrades.md.scss';
import {
  AbilityType,
  ClickCostLevelMax,
  EnergyRegenLevelMax,
  EnergyValueLevelMax,
  getClickCostUpdateLevelCost,
  getEnergyRegenUpgradeLevelCost,
  getEnergyValueUpdateLevelCost,
} from '@app/game/game-levels';
import { formatNumber } from '@utils/common';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { GameStore } from '@app/game/game.store';

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

  override render(): ReactNode {
    return (
      <div className={styles.upgrades}>
        <div className={styles.upgradesBoost}>
          <BoostButtonWithNavigate />
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
}
