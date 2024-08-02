import React, { PureComponent, ReactNode } from 'react';

import { GameContainer } from '@app/game/game-container.component';

import styles from './home.md.scss';

export class Home extends PureComponent {
  override render(): ReactNode {
    return (
      <div className={styles.home}>
        <div className={styles.homeGame}>
          <GameContainer />
        </div>
      </div>
    );
  }
}
