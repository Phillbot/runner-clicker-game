import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';
import Fit from 'react-fit';

import { formatNumber } from '@common/utils/numbers';

import { BoostStore, BoostType } from '@app/boost-button/boost-button.store';
import { BoostButton } from '@app/boost-button/boost-button.component';

import { GameStore } from './game.store';

import styles from './game-balance.md.scss';

@observer
export class GameBalance extends Component {
  @resolve
  private readonly _gameStore: GameStore;
  @resolve
  private readonly _boostStore: BoostStore;

  override render(): React.ReactNode {
    return (
      <div className={styles.gameBalance}>
        <Fit>
          <span
            className={classNames(styles.gameBalanceLabel, {
              [styles.gameBalanceLabelBoostMega]:
                this._boostStore.currentBoostType === BoostType.Mega,
            })}
          >
            {formatNumber(this._gameStore.balance)}
          </span>
        </Fit>
        <BoostButton />
      </div>
    );
  }
}
