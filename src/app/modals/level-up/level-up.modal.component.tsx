import React from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';
import { Button } from '@mui/material';
import { RocketLaunchOutlined } from '@mui/icons-material';

import { Fit } from '@utils/fit.component';
import { assertNever, isNothing, isSomething } from '@utils/common';
import { AbilityType } from '@app/game/game-levels';
import { BalanceStore } from '@app/balance/balance.store';
import { UpgradesStore } from '@app/upgrades/upgrades.store';

import { ModalsStore } from '../modals.store';
import { Modal } from '../modal.component';
import { Modals } from '../types';

import styles from './level-up.md.scss';

@observer
export class LevelUpModal extends React.Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;
  @resolve
  private declare readonly _balanceStore: BalanceStore;
  @resolve
  private declare readonly _upgradesStore: UpgradesStore;

  override render() {
    const isOpen = this._modalStore.isOpen(Modals.LevelUpModal);
    const abilityType = this._modalStore.levelUpModalAbilityType;
    const nextLevelCoast = this._modalStore.levelUpModalNextLevelCoast;

    if (!isSomething(abilityType) || isNothing(nextLevelCoast)) {
      return null;
    }

    const insufficientFunds = this._balanceStore.balance < nextLevelCoast;

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => this._modalStore.closeLevelUpModal()}
      >
        <div className={styles.levelUpModal}>
          <Fit>
            <div className={styles.levelUpModalTitle}>
              {mapAbilityTypeToString(abilityType)}
            </div>
          </Fit>
          <div className={styles.levelUpModalLabel}>
            Update level cost:&nbsp;
            <span
              className={classNames(styles.levelUpModalLabelCost, {
                [styles.levelUpModalLabelCostDisabled]: insufficientFunds,
              })}
            >
              {nextLevelCoast}
            </span>
          </div>

          <div className={styles.levelUpModalConfirmButton}>
            <Button
              endIcon={<RocketLaunchOutlined />}
              variant="contained"
              size="small"
              color="info"
              disabled={insufficientFunds}
              onClick={() => this._upgradesStore.incrementAbility(abilityType)}
            >
              {insufficientFunds ? 'Insufficient Funds' : 'Let`s go'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

function mapAbilityTypeToString(abilityType: AbilityType): string {
  switch (abilityType) {
    case AbilityType.ClickCost:
      return 'Update click level';
    case AbilityType.EnergyLimit:
      return 'Update energy limit level';
    case AbilityType.EnergyRegen:
      return 'Update energy regeneration speed level';
    default:
      return assertNever(abilityType);
  }
}
