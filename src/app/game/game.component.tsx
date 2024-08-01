import React, { Component, createRef, ReactNode } from 'react';
import { ReactSVG } from 'react-svg';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

import mySvg from './images/react.svg';

import styles from './game.md.scss';
import { resolve } from 'inversify-react';
import { GameStore } from './game.store';

type Props = NonNullable<unknown>;

@observer
export class Game extends Component<Props> {
  private gameContainerRef = createRef<HTMLDivElement>();
  @resolve
  private declare readonly _gameStore: GameStore;
  private subscription: Subscription | null = null;

  override componentDidMount(): void {
    if (this.gameContainerRef.current) {
      const clicks$ = fromEvent<MouseEvent>(
        this.gameContainerRef.current,
        'click',
      ).pipe(
        throttleTime(0),
        map(event => {
          const rect = this.gameContainerRef.current?.getBoundingClientRect();
          const x = event.clientX - (rect?.left || 0);
          const y = event.clientY - (rect?.top || 0);
          return { x, y };
        }),
      );

      const touches$ = fromEvent<TouchEvent>(
        this.gameContainerRef.current,
        'touchend',
      ).pipe(
        throttleTime(0),
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
    this._gameStore.stopRegeneration();
  }

  override render(): ReactNode {
    const { isScaled, scaleValue, activeClickMessages } = this._gameStore;

    return (
      <div className={styles.game} ref={this.gameContainerRef}>
        <div className={classNames(styles.gameIcon)}>
          <ReactSVG
            className={classNames(styles.gameIconSvg, {
              [styles.gameIconSvgScale]: isScaled,
            })}
            src={mySvg}
          />
        </div>
        <div>Scale Value: {scaleValue}</div>
        {activeClickMessages.map(click => (
          <div
            key={click.id}
            className={styles.gameClickMessage}
            style={{ left: click.x, top: click.y }}
          >
            -100
          </div>
        ))}
      </div>
    );
  }
}
