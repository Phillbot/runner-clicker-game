import React from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { AbilityType } from '@app/game/game-levels';
import { assertNever, isNothing, isSomething } from '@utils/common';

import { ModalsStore } from './modals.store';
import { Modal } from './modal.component';
import { Modals } from './types';

import styles from './level-up.md.scss';
import { BalanceStore } from '@app/balance/balance.store';
import { GameStore } from '@app/game/game.store';

@observer
export class LevelUpModal extends React.Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;
  @resolve
  private declare readonly _balanceStore: BalanceStore;
  @resolve
  private declare readonly _gameStore: GameStore;

  override render() {
    const isOpen = this._modalStore.isOpen(Modals.LevelUpModal);
    const abilityType = this._modalStore.levelUpModalAbilityType;
    const nextLevelCoast = this._modalStore.levelUpModalNextLevelCoast;

    if (!isSomething(abilityType) || isNothing(nextLevelCoast)) {
      return null;
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => this._modalStore.closeLevelUpModal()}
      >
        <div className={styles.levelUpModal}>
          <div>{nextLevelCoast}</div>
          <button
            disabled={this._balanceStore.balance < nextLevelCoast}
            onClick={() => this._gameStore.incrementAbility(abilityType)}
          >
            {mapAbilityTypeToString(abilityType)}
          </button>
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
