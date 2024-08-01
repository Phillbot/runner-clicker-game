import React, { Component, createRef, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import { ReactSVG } from 'react-svg';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

import { GameStore } from './game.store';
import { GameBalance } from './game-balance.component';

import mySvg from './images/react.svg';
import styles from './game.md.scss';

type Props = NonNullable<unknown>;

@observer
export class Game extends Component<Props> {
  private gameContainerRef = createRef<HTMLDivElement>();
  private gameIconRef = createRef<HTMLDivElement>();
  @resolve
  private declare readonly _gameStore: GameStore;
  private subscription: Subscription | null = null;

  override componentDidMount(): void {
    if (this.gameIconRef.current) {
      const clicks$ = fromEvent<MouseEvent>(
        this.gameIconRef.current,
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
        this.gameIconRef.current,
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

      this.subscription = merge(clicks$, touches$).subscribe(({ x, y }) => {
        this._gameStore.handleEvent(x, y);
      });
    }
  }

  override componentWillUnmount(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  override render(): ReactNode {
    const { isScaled, scaleValue, activeClickMessages, isClickable } =
      this._gameStore;

    const scalePercentage = (scaleValue / 5000) * 100;
    const scaleColor = `rgb(${255 - (255 * scalePercentage) / 100}, ${(255 * scalePercentage) / 100}, 0)`;

    return (
      <div className={styles.game} ref={this.gameContainerRef}>
        <div className={styles.gameBalance}>
          <GameBalance />
        </div>

        <div
          className={classNames(styles.gameIcon, {
            [styles.gameIconUnclickable]: !isClickable,
          })}
          ref={this.gameIconRef}
        >
          <ReactSVG
            className={classNames(styles.gameIconSvg, {
              [styles.gameIconSvgScale]: isScaled,
              [styles.gameIconSvgDisabled]: !isClickable,
            })}
            src={mySvg}
          />
        </div>
        <div className={styles.gameScaleContainer}>
          <div
            className={styles.gameScaleFill}
            style={{
              width: `${scalePercentage}%`,
              backgroundColor: scaleColor,
            }}
          ></div>
          <span className={styles.gameScaleText}>{scaleValue}/5000</span>
        </div>
        {activeClickMessages.map(click => (
          <div
            key={click.id}
            className={styles.gameClickMessage}
            style={{
              left: `${click.x}px`,
              top: `${click.y}px`,
            }}
          >
            {this._gameStore.clickCost}
          </div>
        ))}
      </div>
    );
  }
}
