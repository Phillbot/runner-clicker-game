import React, { PureComponent, ReactNode } from 'react';

import { Fit } from '@common/utils/fit.component';
import styles from './game-balance.md.scss';

export class GameBalance extends PureComponent {
  override render(): ReactNode {
    return (
      <div className={styles.gameBalance}>
        <Fit>
          <span className={styles.gameBalanceLabel}>6000</span>
        </Fit>
      </div>
    );
  }
}
