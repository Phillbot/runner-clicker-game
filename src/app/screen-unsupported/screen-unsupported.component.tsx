import React, { Component, ReactNode } from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { Fit } from '@common/utils/fit.component';
import { EntryStore } from '@app/entry/entry.store';

import styles from './screen-unsupported.md.scss';

@observer
export class ScreenUnsupported extends Component {
  @resolve
  private declare readonly _entryStore: EntryStore;

  override render(): ReactNode {
    const { initDataUnsafe } = this._entryStore.telegram;

    const lng = initDataUnsafe?.user?.language_code;

    return (
      <div className={styles.unsupported}>
        <div className={styles.unsupportedTextContainer}>
          <div className={styles.unsupportedTitle}>
            <Fit>
              <span>
                {t('translation:greetings', {
                  name: initDataUnsafe?.user?.first_name,
                  lng,
                })}
              </span>
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
