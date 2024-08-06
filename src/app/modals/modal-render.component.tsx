import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import { createPortal } from 'react-dom';
import { ModalsStore } from './modals.store';
import type { IModalFactory, Modals } from './types';

@observer
export class ModalRenderer extends Component {
  @resolve
  private declare readonly _modalStore: ModalsStore;

  @resolve('ModalContainer')
  private declare readonly modalContainer: HTMLDivElement;

  @resolve('IModalFactory')
  private declare readonly _modalFactory: IModalFactory;

  renderModal(modalName: Modals) {
    console.log(`Rendering modal: ${modalName}`);
    return this._modalFactory.createModal(modalName);
  }

  override render() {
    console.log('Open modals:', this._modalStore.openModals);
    if (!this.modalContainer) {
      console.error('ModalContainer is not available');
      return null;
    }
    return (
      <>
        {this._modalStore.openModals.map(modalName => {
          const modalElement = this.renderModal(modalName);
          console.log(`Creating portal for modal: ${modalName}`);
          return createPortal(modalElement, this.modalContainer);
        })}
      </>
    );
  }
}
