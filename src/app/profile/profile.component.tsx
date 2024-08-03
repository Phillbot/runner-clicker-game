import React, { PureComponent, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';
import Tooltip from 'rc-tooltip';

import { AddCircle, Wallet } from '@mui/icons-material';
import { IconButton } from '@mui/material';

import { GameStore } from '@app/game/game.store';
import BoostButtonWithNavigate from '@app/boost-button/boost-button.component';

import styles from './profile.md.scss';
import {
  ClickCostLevelMax,
  InitScaleValueLevelMax,
  RegenValueLevelMax,
} from '@app/game/game-levels';

@observer
export class Profile extends PureComponent {
  @resolve
  private declare readonly _gameStore: GameStore;

  override render(): ReactNode {
    const abilities = [
      {
        id: 'click_coast',
        title: 'Click level',
        value: `${this._gameStore.clickCostLevel}/${ClickCostLevelMax}`,
      },

      {
        id: 'energy_limit',
        title: 'Energy level',
        value: `${this._gameStore.initScaleValueLevel}/${InitScaleValueLevelMax}`,
      },
      {
        id: 'regen_value',
        title: 'Regen level',
        value: `${this._gameStore.regenValueLevel}/${RegenValueLevelMax}`,
      },
    ];

    return (
      <div className={styles.profile}>
        <div className={styles.profileTitle}>Profile</div>
        <div className={styles.profileBonusesContainer}>
          <div className={styles.profileBonusesContainerBoost}>
            <BoostButtonWithNavigate />
          </div>

          {abilities.map(({ id, title, value }) => (
            <div key={id} className={styles.profileBonusesContainerItem}>
              <div className={styles.profileBonusesContainerItemBlock}>
                {title}{' '}
              </div>

              <div className={styles.profileBonusesContainerItemBlockWithValue}>
                <span className={styles.profileBonusesContainerItemBlockValue}>
                  {value}
                </span>
              </div>

              <div className={styles.profileBonusesContainerItemIconButton}>
                <IconButton size="large" color="success">
                  <AddCircle />
                </IconButton>
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
                <Wallet fontSize="large" color="error" />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
