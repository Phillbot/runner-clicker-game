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

import { formatNumber } from '@utils/index';
import { GameStore } from '@app/game/game.store';
import { ModalsStore } from '@app/modals/modals.store';
import BoostButtonWithNavigate from '@app/boost-button/boost-button.component';
import {
  ClickCostLevelMax,
  EnergyValueLevelMax,
  EnergyRegenLevelMax,
  AbilityType,
} from '@app/game/game-levels';

import styles from './profile.md.scss';

@observer
export class Profile extends Component {
  @resolve
  private declare readonly _gameStore: GameStore;
  @resolve
  private declare readonly _modalStore: ModalsStore;

  override render(): ReactNode {
    const abilities = [
      {
        id: AbilityType.ClickCost,
        title: 'Click level',
        value: `${this._gameStore.clickCostLevel}/${ClickCostLevelMax}`,
        tooltip: `Points per click - ${formatNumber(this._gameStore.clickCost)} `,
        isMaxLevel: this._gameStore.clickCostLevel === ClickCostLevelMax,
      },
      {
        id: AbilityType.EnergyLimit,
        title: 'Energy level',
        value: `${this._gameStore.energyTotalLevel}/${EnergyValueLevelMax}`,
        tooltip: `Energy limit - ${formatNumber(this._gameStore.energyTotalValue)}`,
        isMaxLevel: this._gameStore.energyTotalLevel === EnergyValueLevelMax,
      },
      {
        id: AbilityType.EnergyRegen,
        title: 'Regen level',
        value: `${this._gameStore.energyRegenLevel}/${EnergyRegenLevelMax}`,
        tooltip: `Point regen per tic - ${formatNumber(this._gameStore.energyRegenValue)}`,
        isMaxLevel: this._gameStore.energyRegenLevel === EnergyRegenLevelMax,
      },
    ];

    return (
      <div className={styles.profile}>
        <div className={styles.profileTitle}>Profile</div>
        <div className={styles.profileBonusesContainer}>
          <div className={styles.profileBonusesContainerBoost}>
            <BoostButtonWithNavigate />
          </div>

          {abilities.map(({ id, title, value, tooltip, isMaxLevel }) => (
            <div key={id} className={styles.profileBonusesContainerItem}>
              <div className={styles.profileBonusesContainerItemBlock}>
                {title}{' '}
              </div>

              <div className={styles.profileBonusesContainerItemBlockWithValue}>
                <Tooltip
                  placement="top"
                  trigger={['hover']}
                  overlay={<span>{tooltip}</span>}
                  showArrow={false}
                >
                  <span
                    className={styles.profileBonusesContainerItemBlockValue}
                  >
                    {value}
                  </span>
                </Tooltip>
              </div>

              <div className={styles.profileBonusesContainerItemIconButton}>
                {isMaxLevel ? (
                  <IconButton size="large" color="success" disableRipple>
                    <DoneAllOutlined />
                  </IconButton>
                ) : (
                  <IconButton
                    size="large"
                    color="primary"
                    onClick={() => this._modalStore.openLevelUpModal(id)}
                  >
                    <AddCircleOutline />
                  </IconButton>
                )}
              </div>
            </div>
          ))}

          <div className={styles.profileBonusesContainerItem}>
            <div
              className={classNames(
                styles.profileBonusesContainerItemBlock,
                styles.profileBonusesContainerItemBlockFull,
              )}
            >
              <Tooltip
                placement="top"
                trigger={['click']}
                overlay={<span>Soon</span>}
                showArrow={false}
              >
                <WalletOutlined fontSize="large" color="error" />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
