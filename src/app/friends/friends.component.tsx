import React, { Component, ReactNode } from 'react';

import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { BalanceStore } from '@app/balance/balance.store';

import styles from './friends.md.scss';
import { FriendsStore } from './friends.store';

@observer
export class Friends extends Component {
  @resolve
  private declare readonly _friendsStore: FriendsStore;
  @resolve
  private declare readonly _balanceStore: BalanceStore;

  override render(): ReactNode {
    return (
      <div className={styles.friends}>
        <div className={styles.friendsReferralLink}>
          {this._friendsStore.refLink}
        </div>
      </div>
    );
  }
}
