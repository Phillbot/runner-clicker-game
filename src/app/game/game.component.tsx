import React, { Component, createRef, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { fromEvent, race, Subscription } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

import { BoostStore, BoostType } from '@app/boost-button/boost-button.store';
import { ReactSVG } from '@app/react-svg/react-svg.component';

import { GameStore } from './game.store';

import styles from './game.md.scss';

@observer
export class Game extends Component {
  private gameContainerRef = createRef<HTMLDivElement>();
  private gameIconRef = createRef<HTMLDivElement>();
  @resolve
  private declare readonly _gameStore: GameStore;
  @resolve
  private declare readonly _boostStore: BoostStore;

  private subscription: Subscription | null = null;

  override componentDidMount(): void {
    if (this.gameIconRef.current) {
      const clicks$ = fromEvent<MouseEvent>(
        this.gameIconRef.current!,
        'click',
      ).pipe(
        throttleTime(10),
        map(event => {
          const rect = this.gameContainerRef.current?.getBoundingClientRect();
          const x = event.clientX - (rect?.left || 0);
          const y = event.clientY - (rect?.top || 0);
          return { x, y };
        }),
      );

      const touches$ = fromEvent<TouchEvent>(
        this.gameIconRef.current!,
        'touchend',
      ).pipe(
        throttleTime(10),
        map(event => {
          const rect = this.gameContainerRef.current?.getBoundingClientRect();
          const x = event.changedTouches[0].clientX - (rect?.left || 0);
          const y = event.changedTouches[0].clientY - (rect?.top || 0);
          return { x, y };
        }),
      );

      this.subscription = race(clicks$, touches$).subscribe(event => {
        if (event) {
          this._gameStore.handleEvent(event.x, event.y);
        }
      });
    }
  }

  override componentWillUnmount(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    const { boostType } = this._boostStore;
    const { clickCost } = this._gameStore;

    switch (boostType) {
      case BoostType.Mega:
        return clickCost * 20;
      case BoostType.Normal:
        return clickCost * 10;
      case BoostType.Tiny:
        return clickCost * 5;
      default:
        return clickCost;
    }
  }
}
