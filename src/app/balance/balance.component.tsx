import { Component, ReactNode } from 'react';
import classNames from 'classnames';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';

import { BoostStore, BoostType } from '@app/boost-button/boost-button.store';
import { Fit, formatNumber } from '@utils/index';

import { BalanceStore } from './balance.store';

import styles from './balance.module.scss';

@observer
export class GameBalance extends Component {
  @resolve
  private readonly _balanceStore: BalanceStore;
  @resolve
  private readonly _boostStore: BoostStore;

  override render(): ReactNode {
    return (
      <Fit>
        <div className={styles.gameBalance}>
          <div
            className={classNames(styles.gameBalanceLabel, {
              [styles.gameBalanceLabelBoostMega]:
                this._boostStore.boostType === BoostType.Mega,
            })}
          >
            {formatNumber(this._balanceStore.balance)}
          </div>
        </div>
      </Fit>
    );
  }
}
