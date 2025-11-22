import { Component, ReactNode } from 'react';
import { RocketLaunchOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import classNames from 'classnames';
import { assertNever } from 'handy-ts-tools';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';

import { BalanceStore } from '@app/balance/balance.store';
import { AbilityType } from '@app/game/game-levels';
import { UpgradesStore } from '@app/upgrades/upgrades.store';
import { isNothing, isSomething } from '@utils/common';
import { Fit } from '@utils/fit.component';

import { Modal } from '../modal.component';
import { ModalsStore } from '../modals.store';
import { Modals } from '../types';

import styles from './level-up.module.scss';

@observer
export class LevelUpModal extends Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;
  @resolve
  private declare readonly _balanceStore: BalanceStore;
  @resolve
  private declare readonly _upgradesStore: UpgradesStore;

  override render(): ReactNode {
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
