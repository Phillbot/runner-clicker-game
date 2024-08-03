import { injectable } from 'inversify';
import { observable, action, makeObservable } from 'mobx';

@injectable()
export class BalanceStore {
  @observable balance: number = 1000;

  constructor() {
    makeObservable(this);
  }

  @action
  incrementBalance = (amount: number) => {
    this.balance += amount;
  };

  @action
  setBalance = (amount: number) => {
    this.balance = amount;
  };
}
