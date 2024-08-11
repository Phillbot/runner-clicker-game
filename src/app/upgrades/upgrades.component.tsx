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

import { Fit } from '@utils/fit.component';
import { ModalsStore } from '@app/modals/modals.store';
import BoostButtonWithNavigate from '@app/boost-button/boost-button.component';

import { UpgradesStore } from './upgrades.store';

import styles from './upgrades.md.scss';

@observer
export class Upgrades extends Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;
  @resolve
  private declare readonly _upgradesStore: UpgradesStore;

  override render(): ReactNode {
    return (
      <div className={styles.upgrades}>
        <Fit>
          <div className={styles.upgradesTitle}>Upgrades</div>
        </Fit>
        <div className={styles.upgradesBonusesContainer}>
          <div className={styles.upgradesBonusesContainerBoost}>
            <BoostButtonWithNavigate />
          </div>
          {this._upgradesStore.abilities.map(
            ({ id, title, value, tooltip, isMaxLevel, nextLevelCoast }) => (
              <div key={id} className={styles.upgradesBonusesContainerItem}>
                <div className={styles.upgradesBonusesContainerItemBlock}>
                  {title}
                </div>

                <div
                  className={styles.upgradesBonusesContainerItemBlockWithValue}
                >
                  <Tooltip
                    destroyTooltipOnHide={true}
                    placement="top"
                    trigger={['hover']}
                    overlay={<span>{tooltip}</span>}
                  >
                    <span
                      className={styles.upgradesBonusesContainerItemBlockValue}
                    >
                      {value}
                    </span>
                  </Tooltip>
                </div>

                <div className={styles.upgradesBonusesContainerItemIconButton}>
                  {isMaxLevel ? (
                    <IconButton size="large" color="success" disableRipple>
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
                      <AddCircleOutline />
                    </IconButton>
                  )}
                </div>
              </div>
            ),
          )}

          <div className={styles.upgradesBonusesContainerItem}>
            <div
              className={classNames(
                styles.upgradesBonusesContainerItemBlock,
                styles.upgradesBonusesContainerItemBlockFull,
              )}
            >
              <Tooltip
                destroyTooltipOnHide={true}
                placement="top"
                trigger={['click']}
                overlay={<span>Soon</span>}
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
