import { Component, createRef, ReactNode } from 'react';
import classNames from 'classnames';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';

import { BoostStore, BoostType } from '@app/boost-button/boost-button.store';
import { ReactSVG } from '@app/react-svg/react-svg.component';

import { ClickInput } from './click-input';
import { GameStore } from './game.store';

import styles from './game.module.scss';

@observer
export class Game extends Component {
  private gameContainerRef = createRef<HTMLDivElement>();
  private gameIconRef = createRef<HTMLDivElement>();
  @resolve
  private declare readonly _gameStore: GameStore;
  @resolve
  private declare readonly _boostStore: BoostStore;

  private clickInput: ClickInput | null = null;

  override componentDidMount(): void {
    const icon = this.gameIconRef.current;
    const container = this.gameContainerRef.current;
    if (!icon || !container) {
      return;
    }

    this.clickInput = new ClickInput(icon, container, point =>
      this._gameStore.handleEvent(
        point.x,
        point.y,
        this._boostStore.boostMultiplier,
      ),
    );
    this.clickInput.start();
  }

  override componentWillUnmount(): void {
    this.clickInput?.dispose();
  }

  override render(): ReactNode {
    const { isScaled, activeClickMessages, isEnergyAvailable } =
      this._gameStore;
    const { boostType } = this._boostStore;

    return (
      <div className={styles.game} ref={this.gameContainerRef}>
        <div
          className={classNames(styles.gameIcon, {
            [styles.gameIconUnclickable]: !isEnergyAvailable,
            [styles.gameIconBoostedMega]: boostType === BoostType.Mega,
            [styles.gameIconBoostedNormal]: boostType === BoostType.Normal,
            [styles.gameIconBoostedTiny]: boostType === BoostType.Tiny,
          })}
          ref={this.gameIconRef}
        >
          <ReactSVG
            svgClasses={classNames(styles.gameIconSvg, {
              [styles.gameIconSvgScale]: isScaled,
              [styles.gameIconSvgDisabled]: !isEnergyAvailable,
            })}
            reactElementsClasses={classNames(styles.gameIconSvgElements, {
              [styles.gameIconSvgElementsBoostedMega]:
                boostType === BoostType.Mega,
            })}
            reactDotsClasses={classNames(styles.gameIconSvgDots, {
              [styles.gameIconSvgDotsBoostedMega]: boostType === BoostType.Mega,
            })}
          />
        </div>
        {activeClickMessages.map(click => (
          <div
            key={click.id}
            className={classNames(styles.gameClickMessage, {
              [styles.gameClickMessageBoostMega]: boostType === BoostType.Mega,
            })}
            style={{
              left: `${click.x}px`,
              top: `${click.y}px`,
            }}
          >
            <span>+{this.boostedClickCost}</span>
          </div>
        ))}
      </div>
    );
  }

  private get boostedClickCost() {
    const { boostMultiplier } = this._boostStore;
    const { clickCost } = this._gameStore;
    return clickCost * boostMultiplier;
  }
}
