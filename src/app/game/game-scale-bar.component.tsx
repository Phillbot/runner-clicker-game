import React from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import { GameStore } from './game.store';
import styles from './game-scale-bar.md.scss';

@observer
export class ScaleBar extends React.Component {
  @resolve
  private readonly _gameStore: GameStore;

  override render(): React.ReactNode {
    const { initScaleValue, scaleValue } = this._gameStore;
    const scalePercentage = (scaleValue / initScaleValue) * 100;
    const scaleColor = this.getScaleColor(scalePercentage);

    return (
      <div className={styles.scaleContainer}>
        <div
          className={styles.scaleContainerScaleFill}
          style={{
            width: `${scalePercentage}%`,
            backgroundColor: scaleColor,
            transition: 'width 0.3s, background-color 0.3s',
          }}
        />
        <div className={styles.scaleContainerScaleText}>
          <span className={styles.scaleContainerScaleTextLabel}>
            {scaleValue}/{initScaleValue}
          </span>
        </div>
      </div>
    );
  }

  private getScaleColor = (percentage: number): string => {
    const colors = [
      { r: 255, g: 0, b: 0 }, // Red
      { r: 255, g: 165, b: 0 }, // Orange
      { r: 27, g: 33, b: 116 }, // Light blue
    ];

    const index = Math.floor((percentage / 100) * (colors.length - 1));
    const nextIndex = Math.min(index + 1, colors.length - 1);
    const factor =
      (percentage % (100 / (colors.length - 1))) / (100 / (colors.length - 1));

    const r = Math.floor(
      colors[index].r + factor * (colors[nextIndex].r - colors[index].r),
    );
    const g = Math.floor(
      colors[index].g + factor * (colors[nextIndex].g - colors[index].g),
    );
    const b = Math.floor(
      colors[index].b + factor * (colors[nextIndex].b - colors[index].b),
    );

    return `rgb(${r}, ${g}, ${b})`;
  };
}
