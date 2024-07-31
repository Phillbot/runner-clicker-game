import React, { Component, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import { t } from 'i18next';
import { observer } from 'mobx-react';

import { GameStore } from '@app/game/game.store';

import styles from './screen-unsupported.md.scss';

type Props = {
  telegram: WebApp;
};

@observer
export class ScreenUnsupported extends Component<Props> {
  @resolve
  private declare readonly _gameStore: GameStore;

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

        {/* <button
          onClick={() => this._gameStore.setTest(this._gameStore.test + 1)}
        >
          {this._gameStore.test}
        </button> */}
        {/* <button
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
        </button> */}
      </div>
    );
  }
}
