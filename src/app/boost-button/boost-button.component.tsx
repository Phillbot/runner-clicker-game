import React, { Component, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { RocketLaunchOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { BoostStore } from './boost-button.store';
import styles from './boost-button.md.scss';

type Props = {
  navigate: ReturnType<typeof useNavigate>;
};

@observer
class BoostButton extends Component<Props> {
  @resolve
  private declare readonly _boostStore: BoostStore;

  handleBoostClick = () => {
    this._boostStore.useDailyBoost();
    this.props.navigate('/');
  };

  override render(): ReactNode {
    return (
      <div className={styles.boostButtonContainer}>
        <div className={styles.boostButtonTimer}>
          {this._boostStore.canUseDailyBoost
            ? 'Take a boost'
            : this._boostStore.timeUntilNextBoost}
        </div>

        <div
          className={classNames(styles.boostButton, {
            [styles.boostButtonDisabled]: !this._boostStore.canUseDailyBoost,
          })}
          onClick={this.handleBoostClick}
        >
          <RocketLaunchOutlined fontSize="large" />
        </div>
      </div>
    );
  }
}

export default function BoostButtonWithNavigate() {
  const navigate = useNavigate();
  return <BoostButton navigate={navigate} />;
}
