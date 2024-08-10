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

import { ProfileStore } from './profile.store';

import styles from './profile.md.scss';

@observer
export class Profile extends Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;
  @resolve
  private declare readonly _profileStore: ProfileStore;

  override render(): ReactNode {
    return (
      <div className={styles.profile}>
        <div className={styles.profileTitle}>Profile</div>
        <div className={styles.profileBonusesContainer}>
          <div className={styles.profileBonusesContainerBoost}>
            <BoostButtonWithNavigate />
          </div>
          {this._profileStore.abilities.map(
            ({ id, title, value, tooltip, isMaxLevel, nextLevelCoast }) => (
              <div key={id} className={styles.profileBonusesContainerItem}>
                <div className={styles.profileBonusesContainerItemBlock}>
                  {title}
                </div>

                <div
                  className={styles.profileBonusesContainerItemBlockWithValue}
                >
                  <Tooltip
                    destroyTooltipOnHide={true}
                    placement="top"
                    trigger={['hover']}
                    overlay={<span>{tooltip}</span>}
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

          <div className={styles.profileBonusesContainerItem}>
            <div
              className={classNames(
                styles.profileBonusesContainerItemBlock,
                styles.profileBonusesContainerItemBlockFull,
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
