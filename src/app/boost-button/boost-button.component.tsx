import React, { Component, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { LocalFireDepartment } from '@mui/icons-material';

import { BoostStore } from './boost-button.store';
import styles from './boost-button.md.scss';

@observer
export class BoostButton extends Component {
  @resolve
  private declare readonly _boostStore: BoostStore;

  override render(): ReactNode {
    return (
      <div className={styles.boostButtonContainer}>
        <div
          title="boost"
          className={classNames(styles.boostButton, {
            [styles.boostButtonDisabled]: !this._boostStore.canUseDailyBoost,
          })}
          onClick={() => this._boostStore.useDailyBoost()}
        >
          <LocalFireDepartment />
        </div>
        {/* {!this._boostStore.canUseDailyBoost && (
          <div className={styles.boostButtonTimer}>
            {this._boostStore.timeUntilNextBoost}
          </div>
        )} */}
      </div>
    );
  }
}

export default BoostButton;
