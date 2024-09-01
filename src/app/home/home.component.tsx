import React, { PureComponent, ReactNode } from 'react';
import { resolve } from 'inversify-react';
import { HelpOutlineOutlined } from '@mui/icons-material';

import { GameContainer } from '@app/game/game-container.component';
import { ModalsStore } from '@app/modals/modals.store';
import { Modals } from '@app/modals/types';

import styles from './home.md.scss';
import { IconButton } from '@mui/material';

export class Home extends PureComponent {
  @resolve
  private declare readonly _modalsStore: ModalsStore;

  override render(): ReactNode {
    return (
      <div className={styles.home}>
        <div className={styles.homeGameInfoButton}>
          <IconButton
            color="info"
            onClick={() => this._modalsStore.openModal(Modals.GameInfoModal)}
          >
            <HelpOutlineOutlined />
          </IconButton>
        </div>
        <div className={styles.homeGame}>
          <GameContainer />
        </div>
      </div>
    );
  }
}
