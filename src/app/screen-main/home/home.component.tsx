import React, { PureComponent, ReactNode } from 'react';

import styles from './home.md.scss';
import { Game } from '@app/game/game.component';

export class Home extends PureComponent {
  override render(): ReactNode {
    return (
      <div className={styles.home}>
        <div className={styles.homeGame}>
          <Game />
        </div>
      </div>
    );
  }
}
