import React, { PureComponent, ReactNode } from 'react';

import { Game } from './game.component';
import { GameBalance } from '../balance/balance.component';
import { EnergyBar } from '../energy-bar/energy-bar.component';

import styles from './game-container.md.scss';

export class GameContainer extends PureComponent {
  override render(): ReactNode {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.gameContainerBalance}>
          <GameBalance />
        </div>
        <div className={styles.gameContainerGame}>
          <Game />
        </div>
        <div className={styles.gameContainerScaleBar}>
          <EnergyBar />
        </div>
      </div>
    );
  }
}
