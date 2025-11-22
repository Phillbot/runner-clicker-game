import type { ReactNode } from 'react';

export enum Modals {
  LevelUpModal,
  GameInfoModal,
}

export interface IModalFactory {
  createModal(modalName: Modals): ReactNode;
}
