import type { ReactNode } from 'react';
import { assertNever } from 'handy-ts-tools';
import { injectable } from 'inversify';

import { GameInfoModal } from './game-info/game-info.modal.component';
import { LevelUpModal } from './level-up/level-up.modal.component';
import { IModalFactory, Modals } from './types';

@injectable()
export class ModalFactory implements IModalFactory {
  createModal(modalName: Modals): ReactNode {
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
