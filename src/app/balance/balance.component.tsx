import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';

import { Fit, formatNumber } from '@utils/index';
import { BoostStore, BoostType } from '@app/boost-button/boost-button.store';

import { BalanceStore } from './balance.store';

import styles from './balance.md.scss';

@observer
export class GameBalance extends Component {
  @resolve
  private readonly _balanceStore: BalanceStore;
  @resolve
  private readonly _boostStore: BoostStore;

  override render(): React.ReactNode {
    return (
      <Fit>
        <div className={styles.gameBalance}>
          <div
            className={classNames(styles.gameBalanceLabel, {
              [styles.gameBalanceLabelBoostMega]:
                this._boostStore.currentBoostType === BoostType.Mega,
            })}
          >
            {formatNumber(this._balanceStore.balance)}
          </div>
        </div>
      </Fit>
    );
  }
}
