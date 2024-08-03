import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { assertNever } from '@common/utils/assert-never';
import { BoostStore, BoostType } from '@app/boost-button/boost-button.store';
import { Fit } from '@common/utils/fit.comonent';
import { formatNumber } from '@common/utils/numbers';

import { GameStore } from '../game/game.store';

import styles from './scale-bar.md.scss';

@observer
export class ScaleBar extends React.Component {
  @resolve
  private readonly _gameStore: GameStore;
  @resolve
  private readonly _boostStore: BoostStore;

  override render(): React.ReactNode {
    const { initScaleValue, scaleValue } = this._gameStore;
    const scalePercentage = (scaleValue / initScaleValue) * 100;
    const scaleColor = this.getScaleColor(scalePercentage);
    const boxShadowBrightness = scalePercentage / 100;
    const { currentBoostType, isBoosted } = this._boostStore;

    return (
      <div
        className={classNames(styles.scaleContainer, {
          [styles.scaleContainerBoost]: isBoosted,
          [styles.scaleContainerBoostMega]: currentBoostType === BoostType.Mega,
        })}
        style={
          {
            '--box-shadow-brightness': boxShadowBrightness,
          } as React.CSSProperties
        }
      >
        <div
          className={styles.scaleContainerScaleFill}
          style={
            isBoosted
              ? {}
              : {
                  width: `${scalePercentage}%`,
                  backgroundColor: scaleColor,
                  transition: 'width 0.3s, background-color 0.3s',
                }
          }
        />
        <Fit>
          <div className={styles.scaleContainerScaleText}>
            {currentBoostType !== null
              ? mapBoostTypeToText(currentBoostType)
              : `${formatNumber(scaleValue)}/${formatNumber(initScaleValue)}`}
          </div>
        </Fit>
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

function mapBoostTypeToText(boostType: BoostType): string {
  switch (boostType) {
    case BoostType.Mega:
      return 'MEGA BOOST';
    case BoostType.Normal:
      return 'BOOST';
    case BoostType.Tiny:
      return 'Tiny boost';
    default:
      return assertNever(boostType);
  }
}
