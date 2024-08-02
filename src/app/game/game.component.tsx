import React, { Component, createRef, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { fromEvent, race, Subscription } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

import { GameStore } from './game.store';
import { ReactSVG } from './react-svg.component';

import styles from './game.md.scss';

type Props = NonNullable<unknown>;

@observer
export class Game extends Component<Props> {
  private gameContainerRef = createRef<HTMLDivElement>();
  private gameIconRef = createRef<HTMLDivElement>();
  @resolve
  private declare readonly _gameStore: GameStore;
  private subscription: Subscription | null = null;

  private readonly isBoosted = false; // need add this feature separately

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
    const { isScaled, activeClickMessages, isClickable } = this._gameStore;

    return (
      <div className={styles.game} ref={this.gameContainerRef}>
        <div
          className={classNames(styles.gameIcon, {
            [styles.gameIconUnclickable]: !isClickable,
            [styles.gameIconBoosted]: this.isBoosted,
          })}
          ref={this.gameIconRef}
        >
          <ReactSVG
            svgClasses={classNames(styles.gameIconSvg, {
              [styles.gameIconSvgScale]: isScaled,
              [styles.gameIconSvgDisabled]: !isClickable,
            })}
            reactElementsClasses={classNames(styles.gameIconSvgElements, {
              [styles.gameIconSvgElementsBoosted]: this.isBoosted,
            })}
            reactDotsClasses={classNames(styles.gameIconSvgDots, {
              [styles.gameIconSvgDotsBoosted]: this.isBoosted,
            })}
          />
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
