import { injectable } from 'inversify';
import { action, makeObservable, observable } from 'mobx';

@injectable()
export class GameStore {
  @observable
  private _test: number = 0;
  constructor() {
    makeObservable(this);
  }

  get test(): number {
    return this._test;
  }

  @action
  setTest(value: number): void {
    this._test = value;
  }
}
