import React, { Component, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import classNames from 'classnames';

import ScreenMain from '@app/screen-main/screen-main.component';
import { ScreenUnsupported } from '@app/screen-unsupported/screen-unsupported.component';

import styles from './entry.md.scss';

export class Entry extends Component {
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  override componentDidMount(): void {
    if (window.Telegram && window.Telegram.WebApp) {
      this._telegram.setHeaderColor('#1d2256');
      this._telegram.ready();
      this._telegram.disableVerticalSwipes();
      this._telegram.expand();
      this._telegram.isClosingConfirmationEnabled = true;
    }
  }

  override render(): ReactNode {
    // const isUnsupportedScreen = this.isDesktop;
    const isUnsupportedScreen = false;

    return (
      <div
        className={classNames(styles.entry, {
          [styles.entryUnsuppoerted]: isUnsupportedScreen,
        })}
      >
        {isUnsupportedScreen ? (
          <ScreenUnsupported telegram={this._telegram} />
        ) : (
          <BrowserRouter>
            <ScreenMain />
          </BrowserRouter>
        )}
      </div>
    );
  }

  private get isDesktop() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /windows|macintosh|linux/.test(userAgent);
  }
}
