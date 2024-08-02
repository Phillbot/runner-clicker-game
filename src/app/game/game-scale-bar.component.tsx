import React from 'react';

import styles from './game-scale-bar.md.scss';

type Props = {
  scaleValue: number;
  initScaleValue: number;
};

const ScaleBar: React.FC<Props> = ({ scaleValue, initScaleValue }) => {
  const scalePercentage = (scaleValue / initScaleValue) * 100;
  const scaleColor = getScaleColor(scalePercentage);

  return (
    <div className={styles.scaleContainer}>
      <div
        className={styles.scaleContainerScaleFill}
        style={{
          width: `${scalePercentage}%`,
          backgroundColor: scaleColor,
        }}
      />
      <div className={styles.scaleContainerScaleText}>
        <span className={styles.scaleContainerScaleTextLabel}>
          {scaleValue}/{initScaleValue}
        </span>
      </div>
    </div>
  );
};

const getScaleColor = (percentage: number): string => {
  // Define colors for the gradient starting from green to red
  const colors = [
    { r: 255, g: 0, b: 0 }, // Red
    { r: 255, g: 165, b: 0 }, // Orange
    { r: 173, g: 216, b: 230 }, // Light Blue
  ];

  // Calculate the index in the colors array
  const index = Math.floor((percentage / 100) * (colors.length - 1));
  const nextIndex = Math.min(index + 1, colors.length - 1);

  // Calculate the interpolation factor
  const factor =
    (percentage % (100 / (colors.length - 1))) / (100 / (colors.length - 1));

  // Interpolate between the two colors
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

export default React.memo(ScaleBar);
