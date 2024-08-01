import React from 'react';

import styles from './game-scale-bar.md.scss';

type Props = {
  scaleValue: number;
  initScaleValue: number;
};

export const ScaleBar: React.FC<Props> = ({ scaleValue, initScaleValue }) => {
  const scalePercentage = (scaleValue / initScaleValue) * 100;
  const scaleColor = `rgb(${255 - (255 * scalePercentage) / 100}, ${(255 * scalePercentage) / 100}, 0)`;

  return (
    <div className={styles.scaleContainer}>
      <div
        className={styles.scaleContainerScaleFill}
        style={{
          width: `${scalePercentage}%`,
          backgroundColor: scaleColor,
        }}
      ></div>
      <span className={styles.scaleContainerScaleText}>
        {scaleValue}/{initScaleValue}
      </span>
    </div>
  );
};

export default React.memo(ScaleBar);
