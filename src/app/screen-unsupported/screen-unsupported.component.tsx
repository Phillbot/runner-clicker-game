import { Component, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';

import { StartupCoordinator } from '@app/entry/startup-coordinator';
import { t } from '@localization/typed-translation';
import { Fit } from '@utils/fit.component';

import styles from './screen-unsupported.module.scss';

@observer
export class ScreenUnsupported extends Component {
  @resolve
  private declare readonly _startupCoordinator: StartupCoordinator;

  override render(): ReactNode {
    const { initDataUnsafe } =
      this._startupCoordinator.telegram ?? ({} as WebApp);

    const lng = initDataUnsafe?.user?.language_code;

    return (
      <div className={styles.unsupported}>
        <div className={styles.unsupportedTextContainer}>
          <div className={styles.unsupportedTitle}>
            <Fit>
              <span>
                {t('greetings', {
                  name: initDataUnsafe?.user?.first_name,
                  lng,
                })}
              </span>
            </Fit>
          </div>
          <div className={styles.unsupportedRedirect}>
            {t('unsupported', { lng })}
          </div>
        </div>
      </div>
    );
  }
}
