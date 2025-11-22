import { Component, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { RocketLaunchOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import classNames from 'classnames';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import Tooltip from 'rc-tooltip';

import { BoostStore } from './boost-button.store';

import styles from './boost-button.module.scss';

type Props = Readonly<{
  navigate: ReturnType<typeof useNavigate>;
}>;

@observer
class BoostButton extends Component<Props> {
  @resolve
  private declare readonly _boostStore: BoostStore;

  override render(): ReactNode {
    return (
      <div className={styles.boostButtonContainer}>
        <div className={styles.boostButtonTimer}>
          {this._boostStore.canUseDailyBoost
            ? 'Take a boost'
            : this._boostStore.timeUntilNextBoost}
        </div>

        <Tooltip
          destroyTooltipOnHide={true}
          overlay={this.renderTooltipContent()}
          visible={this._boostStore.isTooltipVisible}
          placement="left"
          trigger="click"
          onVisibleChange={this.handleTooltipVisibleChange}
        >
          <div
            className={classNames(styles.boostButton, {
              [styles.boostButtonDisabled]: !this._boostStore.canUseDailyBoost,
            })}
            onClick={this.handleBoostClick}
          >
            <RocketLaunchOutlined fontSize="large" />
          </div>
        </Tooltip>
      </div>
    );
  }

  private readonly handleBoostClick = () => {
    if (this._boostStore.canUseDailyBoost) {
      this._boostStore.setTooltipVisible(true);
    }
  };

  private readonly handleConfirmBoost = () => {
    this._boostStore.useDailyBoost();
    this.props.navigate('/');
    this._boostStore.setTooltipVisible(false);
  };

  private readonly handleCancel = () => {
    this._boostStore.setTooltipVisible(false);
  };

  private readonly handleTooltipVisibleChange = (visible: boolean) => {
    this._boostStore.setTooltipVisible(visible);
  };

  private renderTooltipContent(): ReactNode {
    const buttonConfig = {
      fontFamily: 'PressStart',
      fontSize: '0.75em',
      display: 'block',
    };

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>Start boost?</div>
        <div className={styles.tooltipButtonGroup}>
          <Button
            sx={{
              ...buttonConfig,
              color: '#ff0000',
            }}
            className={classNames(
              styles.tooltipButtonGroupButton,
              styles.tooltipButtonGroupButtonYes,
            )}
            size="small"
            variant="contained"
            color="inherit"
            onClick={this.handleConfirmBoost}
          >
            Yes
          </Button>
          <Button
            sx={{ ...buttonConfig }}
            className={styles.tooltipButtonGroupButton}
            size="small"
            variant="contained"
            color="error"
            onClick={this.handleCancel}
          >
            No
          </Button>
        </div>
      </div>
    );
  }
}

export default function BoostButtonWithNavigate() {
  const navigate = useNavigate();
  return <BoostButton navigate={navigate} />;
}
