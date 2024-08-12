export enum Modals {
  LevelUpModal,
}

export interface IModalFactory {
  createModal(modalName: Modals): React.ReactNode;
}
