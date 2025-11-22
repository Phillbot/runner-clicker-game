import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { assertNever } from 'handy-ts-tools';
import { injectable } from 'inversify';

import { SuspenseFallback } from '@app/common/suspense-fallback';

import { IModalFactory, Modals } from './types';

const LevelUpModal = lazy(() =>
  import('./level-up/level-up.modal.component').then(module => ({
    default: module.LevelUpModal,
  })),
);

const GameInfoModal = lazy(() =>
  import('./game-info/game-info.modal.component').then(module => ({
    default: module.GameInfoModal,
  })),
);

@injectable()
export class ModalFactory implements IModalFactory {
  createModal(modalName: Modals): ReactNode {
    switch (modalName) {
      case Modals.LevelUpModal:
        return (
          <Suspense fallback={<SuspenseFallback ariaLabel="Loading modal" />}>
            <LevelUpModal />
          </Suspense>
        );
      case Modals.GameInfoModal:
        return (
          <Suspense fallback={<SuspenseFallback ariaLabel="Loading modal" />}>
            <GameInfoModal />
          </Suspense>
        );
      default:
        return assertNever(modalName);
    }
  }
}
