import { inject, injectable } from 'inversify';
import {
  observable,
  action,
  makeObservable,
  runInAction,
  computed,
} from 'mobx';
import axios from 'axios';

import { EnvUtils } from '@utils/env';
import { BalanceStore } from '@app/balance/balance.store';
import { UpgradesStore } from '@app/upgrades/upgrades.store';
import { Referral } from '@app/entry/types';

interface ReferralWithLoading extends Referral {
  loading?: boolean;
}

@injectable()
export class FriendsStore {
  @observable
  private _friendsList: ReferralWithLoading[] = [];

  @observable
  private _refLink: string = '';

  @observable
  private _botName = '';

  constructor(
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(UpgradesStore) private readonly _upgradesStore: UpgradesStore,
  ) {
    makeObservable(this);
  }

  @action
  setFriendsList(value: ReferralWithLoading[]): void {
    this._friendsList = value;
  }

  @action
  setRefLink(botName: string, userId: number): void {
    this._refLink = `https://t.me/${botName}/app?startapp=${userId}`;
    this._botName = botName;
  }

  @action
  async updateFriendStatus(referredUserId: number): Promise<void> {
    const friend = this._friendsList.find(f => f.userId === referredUserId);
    if (friend) {
      runInAction(() => {
        friend.loading = true;
      });
    }

    try {
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/referral-claim-reward`,
        {
          initData: window.Telegram.WebApp.initData,
          userId: this._upgradesStore.userId,
          referredUserId,
        },
      );
      runInAction(() => {
        // Обновляем баланс и список друзей с новыми данными
        this._friendsList = response.data.referrals.map(
          (referral: ReferralWithLoading) => ({
            ...referral,
            loading: false,
          }),
        );
        this._balanceStore.setBalance(response.data.balance);
        this.setFriendsList(response.data.referrals);
      });
    } catch (error) {
      if (friend) {
        runInAction(() => {
          friend.loading = false;
        });
      }
      console.error('Failed to update friend status', error);
    }
  }

  @computed.struct
  get friendsList(): ReferralWithLoading[] {
    return this._friendsList;
  }

  @computed
  get refLink(): string {
    return this._refLink;
  }

  @computed
  get botName(): string {
    return this._botName;
  }
}
