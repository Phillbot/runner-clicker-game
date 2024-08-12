import { injectable } from 'inversify';
import { action, computed, makeObservable, observable } from 'mobx';
import { Referral } from './types';

@injectable()
export class FriendsStore {
  @observable
  private _friendsList: Referral[] = [];

  @observable
  private _refLink: string = '';

  constructor() {
    makeObservable(this);
  }

  @action
  setFriendsList(value: []): void {
    this._friendsList = value;
  }

  @action
  setRefLink(botName: string, userId: number): void {
    this._refLink = `https://t.me/${botName}/app?startapp=${userId}`;
  }

  @computed.struct
  get friendsList(): Referral[] {
    return this._friendsList;
  }

  @computed
  get refLink(): string {
    return this._refLink;
  }
}
