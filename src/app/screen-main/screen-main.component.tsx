import React, { Component, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import { NavPanel } from './nav-panel/nav-panel.component';
import AppRoutes from './router';

import styles from './screen-main.md.scss';

type Props = WithTranslation;

class ScreenMain extends Component<Props> {
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  override componentDidMount(): void {
    this._telegram.ready();
  }

  override render(): ReactNode {
    return (
      <div className={styles.screenMain}>
        <AppRoutes />
        <NavPanel />
      </div>
    );
  }
}

export default withTranslation()(ScreenMain);
