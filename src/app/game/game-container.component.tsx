import React, { PureComponent, ReactNode } from 'react';

import { Game } from './game.component';
import { GameBalance } from './game-balance.component';
import { ScaleBar } from './game-scale-bar.component';

import styles from './game-container.md.scss';
import { Observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import { GameStore } from './game.store';
import { AddReaction } from '@mui/icons-material';

export class GameContainer extends PureComponent {
  @resolve
  private declare readonly _gameStore: GameStore;
  private containerRef = React.createRef<HTMLDivElement>();

  override render(): ReactNode {
    return (
      <div className={styles.gameContainer} ref={this.containerRef}>
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
          {() =>
            this._gameStore.showBoostButton ? (
              <div
                className={styles.gameContainerBoostButton}
                onClick={() => this._gameStore.toggleBoosted()}
                style={this.getRandomPosition()}
              >
                <AddReaction />
              </div>
            ) : null
          }
        </Observer>
      </div>
    );
  }

  private getRandomPosition = () => {
    if (!this.containerRef.current) return {};

    const containerWidth = this.containerRef.current.clientWidth;
    const containerHeight = this.containerRef.current.clientHeight;

    const buttonWidth = 80;
    const buttonHeight = 80;

    const maxX = containerWidth - buttonWidth;
    const maxY = containerHeight - buttonHeight;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    return { left: `${randomX}px`, top: `${randomY}px` };
  };
}
