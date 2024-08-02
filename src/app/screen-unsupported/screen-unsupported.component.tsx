import React, { Component, ReactNode } from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';

import styles from './screen-unsupported.md.scss';
import { Fit } from '@common/utils/fit.component';

type Props = {
  telegram: WebApp;
};

@observer
export class ScreenUnsupported extends Component<Props> {
  override render(): ReactNode {
    const {
      telegram: { initDataUnsafe },
    } = this.props;

    const lng = initDataUnsafe?.user?.language_code;

    return (
      <div className={styles.unsupported}>
        <div className={styles.unsupportedTextContainer}>
          <div className={styles.unsupportedTitle}>
            <Fit>
              {t('translation:greetings', {
                name: initDataUnsafe?.user?.first_name,
                lng,
              })}
            </Fit>
          </div>
          <div className={styles.unsupportedRedirect}>
            {t('translation:unsupported', {
              lng,
            })}
          </div>
        </div>
      </div>
    );
  }
}
