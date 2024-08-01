import React, { Component, ReactNode } from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';

import styles from './screen-unsupported.md.scss';

type Props = {
  telegram: WebApp;
};

@observer
export class ScreenUnsupported extends Component<Props> {
  override render(): ReactNode {
    const {
      telegram: { initDataUnsafe },
    } = this.props;

    return (
      <div className={styles.unsupported}>
        <div className={styles.unsupportedTitle}>
          {t('translation:greetings', {
            name: initDataUnsafe?.user?.first_name,
            lng: initDataUnsafe?.user?.language_code,
          })}
        </div>
      </div>
    );
  }
}
