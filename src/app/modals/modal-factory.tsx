import React from 'react';
import { injectable } from 'inversify';
import { assertNever } from '@utils/common';

import { IModalFactory, Modals } from './types';
import { LevelUpModal } from './level-up.modal.component';

@injectable()
export class ModalFactory implements IModalFactory {
  createModal(modalName: Modals): React.ReactNode {
    switch (modalName) {
      case Modals.LevelUpModal:
        return <LevelUpModal />;
      default:
        return assertNever(modalName);
    }
  }
}
