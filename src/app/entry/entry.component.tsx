import React, { Component, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import ScreenMain from '@app/screen-main/screen-main.component';
import { ScreenUnsupported } from '@app/screen-unsupported/screen-unsupported.component';

import styles from './entry.md.scss';
import classNames from 'classnames';

type Props = WithTranslation;

class Entry extends Component<Props> {
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  override componentDidMount(): void {
    this._telegram.ready();
  }

  override render(): ReactNode {
    const isUnsupportedScreen = !this.isDesktop;

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

export default withTranslation()(Entry);
