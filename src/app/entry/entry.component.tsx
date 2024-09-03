import React, { Component, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import { Box, LinearProgress } from '@mui/material';

import { EnvUtils } from '@utils/env';
import { ScreenMain } from '@app/screen-main/screen-main.component';
import { ScreenUnsupported } from '@app/screen-unsupported/screen-unsupported.component';
import { BalanceStore } from '@app/balance/balance.store';

import { EntryStore } from './entry.store';
import { UserStatus } from './types';

import styles from './entry.md.scss';

@observer
export class Entry extends Component {
  @resolve
  private declare readonly _entryStore: EntryStore;
  @resolve
  private declare readonly _balanceStore: BalanceStore;

  override async componentDidMount(): Promise<void> {
    if (this._entryStore.isUnsupportedScreen) {
      this._entryStore.setLoading(false);
      this._entryStore.setAuthorized(false);
    } else {
      await this._entryStore.initialize();
    }
  }

  override render(): ReactNode {
    const {
      isLoading,
      isAuthorized,
      resourcesLoaded,
      loadProgress,
      isUnsupportedScreen,
    } = this._entryStore;

    if (isUnsupportedScreen) {
      this._entryStore.telegram.disableClosingConfirmation();

      return (
        <div className={classNames(styles.entry, styles.entryUnsupported)}>
          <ScreenUnsupported />
        </div>
      );
    }

    if (isLoading || !resourcesLoaded) {
      return (
        <div className={classNames(styles.entry, styles.entryLoading)}>
          <div className={styles.entryLoadingLoader}>
            <div className={styles.entryLoadingLoaderLabel}>
              {Math.round(loadProgress)}%
            </div>
            <Box sx={{ width: '50%' }}>
              <LinearProgress
                variant="determinate"
                color="primary"
                value={loadProgress}
              />
            </Box>
          </div>
        </div>
      );
    }

    if (
      EnvUtils.avoidUnsupportedScreen &&
      (!isAuthorized || this._entryStore.userStatus !== UserStatus.ACTIVE)
    ) {
      return (
        <div className={classNames(styles.entry, styles.entryNotAuth)}>
          <div className={styles.entryNotAuthLabel}>
            What do you expect to see in this place, mortal?
          </div>
        </div>
      );
    }

    return (
      <div className={styles.entry}>
        <BrowserRouter>
          <ScreenMain />
        </BrowserRouter>
      </div>
    );
  }
}
