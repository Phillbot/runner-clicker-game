import React from 'react';
import { injectable } from 'inversify';
import { assertNever } from '@utils/common';

import { IModalFactory, Modals } from './types';
import { LevelUpModal } from './level-up/level-up.modal.component';
import { GameInfoModal } from './game-info/game-info.modal.component';

@injectable()
export class ModalFactory implements IModalFactory {
  createModal(modalName: Modals): React.ReactNode {
    switch (modalName) {
      case Modals.LevelUpModal:
        return <LevelUpModal />;
      case Modals.GameInfoModal:
        return <GameInfoModal />;
      default:
        return assertNever(modalName);
    }
  }
}
