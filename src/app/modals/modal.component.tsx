import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import styles from './modal.md.scss';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export class Modal extends React.Component<ModalProps> {
  private destroy$ = new Subject<void>();
  private modalContainer: HTMLElement | null = null;

  override componentDidMount() {
    this.addKeydownListener();
    this.modalContainer = document.getElementById('modal-container');
    if (!this.modalContainer) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.id = 'modal-container';
      document.body.appendChild(this.modalContainer);
    }
  }

  override componentDidUpdate(prevProps: ModalProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.addKeydownListener();
    } else if (!this.props.isOpen && prevProps.isOpen) {
      this.removeKeydownListener();
    }
  }

  override componentWillUnmount() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addKeydownListener() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(event => event.key === 'Escape'),
        takeUntil(this.destroy$),
      )
      .subscribe(this.props.onClose);
  }

  removeKeydownListener() {
    this.destroy$.next();
  }

  override render() {
    const { isOpen, onClose, children } = this.props;

    const modalContainer = document.getElementById('modal-container');

    if (!modalContainer) {
      console.error('Modal container is not available');
      return null;
    }

    return ReactDOM.createPortal(
      <div
        className={classNames(styles.modalOverlay, {
          [styles.modalOverlayOpen]: isOpen,
        })}
        onClick={onClose}
      >
        <div
          className={classNames(styles.modalContent, {
            [styles.modalContentOpen]: isOpen,
          })}
          onClick={e => e.stopPropagation()}
        >
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
          <div className={styles.modalContentScrollable}>{children}</div>
        </div>
      </div>,
      modalContainer,
    );
  }
}
