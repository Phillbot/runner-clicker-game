import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './game-balance.md.scss';
import { resolve } from 'inversify-react';
import { GameStore } from './game.store';
import { formatNumber } from '@common/utils/numbers';

@observer
export class GameBalance extends Component {
  @resolve
  private readonly _gameStore: GameStore;

  override render(): React.ReactNode {
    return (
      <div className={styles.gameBalance}>
        <span className={styles.gameBalanceLabel}>
          {formatNumber(this._gameStore.balance)}
        </span>
      </div>
    );
  }
}
