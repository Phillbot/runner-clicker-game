import { injectable } from 'inversify';
import { action, computed, makeObservable, observable } from 'mobx';

@injectable()
export class LoadingOverlayStore {
  @observable
  private _isLoading: boolean = false;

  constructor() {
    makeObservable(this);
  }

  @computed
  get isLoading(): boolean {
    return this._isLoading;
  }

  @action
  setIsLoading(value: boolean): void {
    this._isLoading = value;
  }
}
