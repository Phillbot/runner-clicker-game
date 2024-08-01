import React, { PureComponent, ReactNode } from 'react';

import styles from './game-balance.md.scss';

export class GameBalance extends PureComponent {
  override render(): ReactNode {
    return (
      <div className={styles.gameBalance}>
        <span className={styles.gameBalanceLabel}>6000</span>
      </div>
    );
  }
}
