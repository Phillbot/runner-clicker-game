import React, { Component, ReactNode } from 'react';
import { ReactSVG } from 'react-svg';

import mySvg from './images/f.svg';
import styles from './unsupported.md.scss';

export class Unsupported extends Component {
  override render(): ReactNode {
    return (
      <div className={styles.unsupported}>
        <div className={styles.unsupportedIcon}>
          <ReactSVG className={styles.unsupportedIconSvg} src={mySvg} />
        </div>
      </div>
    );
  }
}
