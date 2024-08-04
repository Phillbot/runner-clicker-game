import React, { Component, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import classNames from 'classnames';
import axios from 'axios';

import { avoidTelegramAuth, isDesktop, isProd } from '@common/utils/utils';
import { ScreenMain } from '@app/screen-main/screen-main.component';
import { ScreenUnsupported } from '@app/screen-unsupported/screen-unsupported.component';

import styles from './entry.md.scss';

type State = {
  isLoading: boolean;
  isAuthorized: boolean;
};

type Props = NonNullable<unknown>;

const isUnsupportedScreen = isProd() && isDesktop();

console.log(isUnsupportedScreen);

export class Entry extends Component<Props, State> {
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isAuthorized: false,
    };
  }

  override componentDidMount(): void {
    if (isUnsupportedScreen) {
      this.setState({ isLoading: false, isAuthorized: false });
    } else {
      if (window.Telegram && window.Telegram.WebApp) {
        this._telegram.setHeaderColor('#1d2256');
        this._telegram.ready();
        this._telegram.disableVerticalSwipes();
        this._telegram.expand();
        this._telegram.isClosingConfirmationEnabled = true;
      }
      this.checkAuth();
    }
  }

  checkAuth = async () => {
    if (avoidTelegramAuth() && !isProd()) {
      this.setState({ isLoading: false, isAuthorized: true });
      return;
    }

    const initData = window.Telegram.WebApp.initData;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_TELEGRAM_GAME_ENDPOINT_URL!}/react-clicker-bot/auth`,
        {
          initData,
        },
      );

      if (response.data.success) {
        this.setState({ isLoading: false, isAuthorized: true });
      } else {
        this.setState({ isLoading: false, isAuthorized: false });
      }
    } catch (error) {
      console.error('Authorization check failed', error);
      this.setState({ isLoading: false, isAuthorized: false });
    }
  };

  override render(): ReactNode {
    const { isLoading, isAuthorized } = this.state;

    if (isUnsupportedScreen) {
      return (
        <div className={classNames(styles.entry, styles.entryUnsupported)}>
          <ScreenUnsupported telegram={this._telegram} />
        </div>
      );
    }

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthorized) {
      return (
        <div className={classNames(styles.entry, styles.entryUnsupported)}>
          <ScreenUnsupported telegram={this._telegram} />
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
