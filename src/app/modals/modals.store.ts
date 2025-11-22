import { injectable } from 'inversify';
import {
  action,
  computed,
  makeObservable,
  observable,
  ObservableMap,
} from 'mobx';

import { AbilityType } from '@app/game/game-levels';

import { Modals } from './types';

@injectable()
export class ModalsStore {
  @observable
  private readonly _modalsState: ObservableMap<Modals, boolean>;

  @observable
  private _levelUpModalAbilityType: AbilityType | null = null;
  private _levelUpModalNextLevelCoast: number | undefined;

  constructor() {
    this._modalsState = observable.map<Modals, boolean>([
      [Modals.LevelUpModal, false],
      [Modals.GameInfoModal, false],
    ]);
    makeObservable(this);
  }

  @computed
  get isOpen(): (modalName: Modals) => boolean {
    return (modalName: Modals) => this._modalsState.get(modalName) || false;
  }

  @computed
  get openModals(): Modals[] {
    return Array.from(this._modalsState.entries())
      .filter(([_, isOpen]) => isOpen)
      .map(([modalName]) => modalName);
  }

  // TODO: move to separately store?
  @computed
  get levelUpModalAbilityType(): AbilityType | null {
    return this._levelUpModalAbilityType;
  }

  @computed
  get levelUpModalNextLevelCoast(): AbilityType | undefined {
    return this._levelUpModalNextLevelCoast;
  }

  @action.bound
  openModal(modalType: Modals): void {
    this._modalsState.set(modalType, true);
  }

  @action.bound
  closeModal(modalType: Modals): void {
    this._modalsState.set(modalType, false);
  }

  @action.bound
  openLevelUpModal(
    abilityType: AbilityType,
    nextLevelCoast: number | undefined,
  ): void {
    this._modalsState.set(Modals.LevelUpModal, true);
    this._levelUpModalAbilityType = abilityType;
    this._levelUpModalNextLevelCoast = nextLevelCoast;
  }

  @action.bound
  closeLevelUpModal(): void {
    this._modalsState.set(Modals.LevelUpModal, false);
    this._levelUpModalAbilityType = null;
    this._levelUpModalNextLevelCoast = undefined;
  }
}
