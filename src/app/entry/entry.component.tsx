import React, { Component, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ScreenUnsupported } from '@app/screen-unsupported/screen-unsupported.component';
import styles from './entry.md.scss';

type Props = WithTranslation;

class Entry extends Component<Props> {
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

export default withTranslation()(Entry);
