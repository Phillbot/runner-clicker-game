import React from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { ModalsStore } from '../modals.store';
import { Modal } from '../modal.component';
import { Modals } from '../types';

import styles from './game-info.md.scss';

@observer
export class GameInfoModal extends React.Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;

  override render() {
    const isOpen = this._modalStore.isOpen(Modals.GameInfoModal);

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => this._modalStore.closeModal(Modals.GameInfoModal)}
      >
        <div className={styles.gameInfoModal}>
          <div className={styles.gameInfoModalTitle}>Game Info</div>
          <div className={styles.gameInfoModalText}>
            <span className={styles.gameInfoModalTextBold}>Game - </span>
            you can earn points by clicking the image on the spinning atom. The
            limit of clicks your energy
          </div>
          <div className={styles.gameInfoModalText}>
            <span className={styles.gameInfoModalTextBold}>Energy - </span>
            you need energy for your game. One point - one click. Energy
            regenerate automatically
          </div>
          <div className={styles.gameInfoModalText}>
            <span className={styles.gameInfoModalTextBold}>Upgrades - </span>
            you can upgrade your click, energy limit and energy regeneration
            speed. Every upgrade cost points
          </div>
          <div className={styles.gameInfoModalText}>
            <span className={styles.gameInfoModalTextBold}>Friends - </span>
            you can invite your friend and earn 1000 point by every. Also, you
            friend can help earn more points in future by new mechanic (still in
            progress)
          </div>
          <div className={styles.gameInfoModalText}>
            <span className={styles.gameInfoModalTextBold}>Tasks - </span>
            after beta testing, you will be able to find and complete tasks for
            rewards. These are simple activities such as watching videos,
            subscribing to social networks and others.
          </div>
          <div className={styles.gameInfoModalText}>
            You can contact with your questions or bug reports{' '}
            <a href="https://t.me/phillb0t">founder</a>
          </div>
        </div>
      </Modal>
    );
  }
}
