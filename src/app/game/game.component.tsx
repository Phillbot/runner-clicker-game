import React, { Component, createRef, ReactNode } from 'react';
import { ReactSVG } from 'react-svg';
import classNames from 'classnames';
import { fromEvent } from 'rxjs';

import mySvg from './images/react.svg';

import styles from './game.md.scss';

type Props = NonNullable<unknown>;

type State = {
  isScaled: boolean;
  clickMessages: { id: number; x: number; y: number }[];
};

export class Game extends Component<Props, State> {
  private gameContainerRef = createRef<HTMLDivElement>();
  private clickId = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      isScaled: false,
      clickMessages: [],
    };
  }

  override componentDidMount(): void {
    if (this.gameContainerRef.current) {
      const clicks$ = fromEvent<MouseEvent>(
        this.gameContainerRef.current,
        'click',
      );
      const touches$ = fromEvent<TouchEvent>(
        this.gameContainerRef.current,
        'touchend',
      );

      const handleEvent = (event: MouseEvent | TouchEvent): void => {
        event.preventDefault();
        const rect = this.gameContainerRef.current?.getBoundingClientRect();
        let x: number;
        let y: number;

        if (event instanceof MouseEvent) {
          x = event.clientX - (rect?.left || 0);
          y = event.clientY - (rect?.top || 0);
        } else {
          x = event.changedTouches[0].clientX - (rect?.left || 0);
          y = event.changedTouches[0].clientY - (rect?.top || 0);
        }

        const newClickId = this.clickId++;

        this.setState(prevState => ({
          isScaled: true,
          clickMessages: [...prevState.clickMessages, { id: newClickId, x, y }],
        }));

        // Перезапуск анимации скейла
        this.restartScaleAnimation();

        // Удаление сообщения после анимации
        setTimeout(() => {
          this.setState(prevState => ({
            clickMessages: prevState.clickMessages.filter(
              click => click.id !== newClickId,
            ),
          }));
        }, 500);

        setTimeout(() => {
          this.setState({ isScaled: false });
        }, 500);
      };

      clicks$.subscribe(handleEvent);
      touches$.subscribe(handleEvent);
    }
  }

  private restartScaleAnimation(): void {
    this.setState({ isScaled: false }, () => {
      setTimeout(() => {
        this.setState({ isScaled: true });
        setTimeout(() => {
          this.setState({ isScaled: false });
        }, 100);
      }, 0);
    });
  }

  override render(): ReactNode {
    const { isScaled, clickMessages } = this.state;

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
        {clickMessages.map(click => (
          <div
            key={click.id}
            className={styles.gameClickMessage}
            style={{ left: click.x, top: click.y }}
          >
            +100
          </div>
        ))}
      </div>
    );
  }
}
