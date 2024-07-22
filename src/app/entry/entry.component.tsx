import React, { Component, ReactNode } from 'react';

import { ScreenUnsupported } from '@app/screen-unsupported/screen-unsupported.component';

import styles from './entry.md.scss';

export class Entry extends Component {
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  override componentDidMount(): void {
    this._telegram.ready();
  }

  override render(): ReactNode {
    return (
      <div className={styles.entry}>
        <ScreenUnsupported telegram={this._telegram} />
      </div>
    );
  }
}
