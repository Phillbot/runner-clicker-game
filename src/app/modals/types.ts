export enum Modals {
  LevelUpModal,
  GameInfoModal,
}

export interface IModalFactory {
  createModal(modalName: Modals): React.ReactNode;
}
