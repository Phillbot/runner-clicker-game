import { Component, ReactNode } from 'react';
import { Check, IosShareOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';

import { EnvUtils } from '@utils/env';

import { FriendsStore } from './friends.store';

import styles from './friends.module.scss';

@observer
export class Friends extends Component {
  @resolve
  private declare readonly _friendsStore: FriendsStore;

  override render(): ReactNode {
    return (
      <div className={styles.friends}>
        <div className={styles.friendsList}>
          {[...this._friendsStore.friendsList].map(
            ({ firstName, userName, userId, rewardClaim, loading }) => (
              <div key={userId} className={styles.friendsListItem}>
                <div className={styles.friendsListItemName}>
                  {userName || firstName}
                </div>

                {rewardClaim ? (
                  <div className={styles.friendsListItemRewardsDone}>
                    1000 <Check fontSize="small" />
                  </div>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={loading}
                    onClick={() =>
                      this._friendsStore.updateFriendStatus(userId)
                    }
                  >
                    {loading ? <CircularProgress size={20} /> : 'Claim'}
                  </Button>
                )}
              </div>
            ),
          )}
        </div>
        <div className={styles.shareLinkWrapper}>
          <Button
            className={styles.friendsButton}
            size="small"
            endIcon={<IosShareOutlined />}
            variant="contained"
            href={
              EnvUtils.isDev && EnvUtils.enableMock
                ? undefined
                : `https://t.me/share/url?url=${this._friendsStore.refLink}&text=Привіт! Го грати зі мною в клікера!`
            }
            onClick={
              EnvUtils.isDev && EnvUtils.enableMock
                ? () => this._friendsStore.addMockFriend()
                : undefined
            }
          >
            {EnvUtils.isDev && EnvUtils.enableMock
              ? 'Add mock friend'
              : 'Invite Friends!'}
          </Button>
        </div>
      </div>
    );
  }
}
