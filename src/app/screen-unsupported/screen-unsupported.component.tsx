import React, { Component, ReactNode } from 'react';
import { ReactSVG } from 'react-svg';

import mySvg from './images/react.svg';

import styles from './screen-unsupported.md.scss';

type Props = {
  telegram: WebApp;
};

export class ScreenUnsupported extends Component<Props> {
  override render(): ReactNode {
    const {
      telegram: { initDataUnsafe },
    } = this.props;

    return (
      <div className={styles.unsupported}>
        <div className={styles.unsupportedTitle}>
          Здравствуй, {initDataUnsafe?.user?.first_name}
        </div>
        <div className={styles.unsupportedIcon}>
          <ReactSVG className={styles.unsupportedIconSvg} src={mySvg} />
        </div>
      </div>
    );
  }
}
