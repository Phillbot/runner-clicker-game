import React, { PureComponent, ReactNode } from 'react';

import { NavPanel } from '@app/nav-panel/nav-panel.component';
import AppRoutes from '@app/router/router';

import styles from './screen-main.md.scss';

export class ScreenMain extends PureComponent {
  override render(): ReactNode {
    return (
      <div className={styles.screenMain}>
        <AppRoutes />
        <NavPanel />
      </div>
    );
  }
}
