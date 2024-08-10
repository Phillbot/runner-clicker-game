import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { assertNever, Fit } from '@utils/index';
import { BoostStore, BoostType } from '@app/boost-button/boost-button.store';

import { EnergyStore } from './energy.store';

import styles from './energy-bar.md.scss';

@observer
export class EnergyBar extends React.Component {
  @resolve
  private readonly _energyStore: EnergyStore;
  @resolve
  private readonly _boostStore: BoostStore;

  override render(): React.ReactNode {
    const { energyTotalValue, availableEnergyValue } = this._energyStore;
    const scalePercentage = (availableEnergyValue / energyTotalValue) * 100;
    const scaleColor = getScaleColor(scalePercentage);
    const boxShadowBrightness = scalePercentage / 100;
    const { boostType, isBoosted } = this._boostStore;

    const scaleFillStyle = isBoosted
      ? {}
      : {
          width: `${scalePercentage}%`,
          backgroundColor: scaleColor,
          transition: 'width 0.3s, background-color 0.3s',
        };

    return (
      <div
        className={classNames(styles.scaleContainer, {
          [styles.scaleContainerBoost]: isBoosted,
          [styles.scaleContainerBoostMega]: boostType === BoostType.Mega,
        })}
        style={
          {
            '--box-shadow-brightness': boxShadowBrightness,
          } as React.CSSProperties
        }
      >
        <div
          className={styles.scaleContainerScaleFill}
          style={scaleFillStyle}
        />
        <Fit>
          <div className={styles.scaleContainerScaleText}>
            {boostType !== null
              ? mapBoostTypeToText(boostType)
              : `${Math.ceil(availableEnergyValue)}/${Math.ceil(energyTotalValue)}`}
          </div>
        </Fit>
      </div>
    );
  }
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

function getScaleColor(percentage: number): string {
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
}
