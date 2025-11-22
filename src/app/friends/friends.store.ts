import { inject, injectable } from 'inversify';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import { BalanceStore } from '@app/balance/balance.store';
import { ApiClient } from '@app/common/api-client';
import { TelegramService } from '@app/entry/services/telegram.service';
import { Referral } from '@app/entry/types';
import { UpgradesStore } from '@app/upgrades/upgrades.store';
import { EnvUtils } from '@utils/env';

interface ReferralWithLoading extends Referral {
  loading?: boolean;
}

type ReferralClaimResponse = Readonly<{
  referrals: ReferralWithLoading[];
  balance: number;
}>;

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
    @inject(ApiClient) private readonly _apiClient: ApiClient,
    @inject(TelegramService)
    private readonly _telegramService: TelegramService,
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

    // Mock mode: instantly grant reward without server
    if (EnvUtils.isDev && EnvUtils.enableMock) {
      runInAction(() => {
        this._friendsList = this._friendsList.map(f =>
          f.userId === referredUserId
            ? { ...f, rewardClaim: true, loading: false }
            : f,
        );
        this._balanceStore.incrementBalance(1000);
      });
      return;
    }

    try {
      const response = await this._apiClient.post<ReferralClaimResponse>(
        EnvUtils.apiEndpoints.referralClaimReward,
        {
          initData: this._telegramService.initData,
          userId: this._upgradesStore.userId,
          referredUserId,
        },
      );
      runInAction(() => {
        this._friendsList = response.referrals.map(
          (referral: ReferralWithLoading) => ({
            ...referral,
            loading: false,
          }),
        );
        this._balanceStore.setBalance(response.balance);
        this.setFriendsList(response.referrals);
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

  @action
  addMockFriend(): void {
    const randomId = Math.floor(Math.random() * 1_000_000_000);
    const newFriend: ReferralWithLoading = {
      userId: randomId,
      firstName: 'Mock',
      userName: `mock_friend_${randomId}`,
      rewardClaim: false,
      regData: Date.now(),
      userStatus: 1,
      balance: 0,
      referralId: null,
    };
    this._friendsList = [...this._friendsList, newFriend];
  }
}
