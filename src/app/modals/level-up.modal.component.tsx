import React from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { AbilityType } from '@app/game/game-levels';
import { assertNever, isSomething } from '@utils/common';

import { ModalsStore } from './modals.store';
import { Modal } from './modal.component';
import { Modals } from './types';

import styles from './level-up.md.scss';

@observer
export class LevelUpModal extends React.Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;

  override render() {
    const isOpen = this._modalStore.isOpen(Modals.LevelUpModal);
    const abilityType = this._modalStore.levelUpModalAbilityType; // TODO: common type with server ?

    if (!isSomething(abilityType)) {
      return null;
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => this._modalStore.closeLevelUpModal()}
      >
        <div className={styles.levelUpModal}>
          <div>lorem1000</div>
          <button onClick={() => console.log(abilityType)}>
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
