import React, { PureComponent, ReactNode } from 'react';

import { Game } from './game.component';
import { GameBalance } from './game-balance.component';
import { ScaleBar } from './game-scale-bar.component';

import styles from './game-container.md.scss';
import { Observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import { GameStore } from './game.store';

export class GameContainer extends PureComponent {
  @resolve
  private declare readonly _gameStore: GameStore;
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
          <ScaleBar />
        </div>
        <Observer>
          {() => {
            return (
              <div onClick={() => this._gameStore.toggleBusted()}>isBusted</div>
            );
          }}
        </Observer>
      </div>
    );
  }
}
