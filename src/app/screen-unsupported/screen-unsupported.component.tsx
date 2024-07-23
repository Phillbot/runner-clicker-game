import React, { Component, ReactNode } from 'react';
import { ReactSVG } from 'react-svg';
import { t } from 'i18next';

import mySvg from './images/react.svg';

import styles from './screen-unsupported.md.scss';

type Props = {
  telegram: WebApp;
};

export class ScreenUnsupported extends Component<Props> {
  override componentDidMount(): void {
    const {
      telegram: { expand, disableVerticalSwipes },
    } = this.props;

    disableVerticalSwipes();
    expand();
  }

  override render(): ReactNode {
    const {
      telegram: { initDataUnsafe, showAlert, headerColor },
    } = this.props;

    return (
      <div className={styles.unsupported}>
        <div className={styles.unsupportedTitle}>
          {t('translation:greetings', {
            name: initDataUnsafe?.user?.first_name,
            lng: initDataUnsafe?.user?.language_code,
          })}
          {/* Здравствуй, {initDataUnsafe?.user?.first_name} */}
        </div>
        <div className={styles.unsupportedIcon}>
          <ReactSVG className={styles.unsupportedIconSvg} src={mySvg} />
        </div>
        <button
          type="button"
          onClick={() => {
            try {
              showAlert(headerColor);
            } catch (error) {
              alert(123);
            }
          }}
        >
          1sss
        </button>
      </div>
    );
  }
}
