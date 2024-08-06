import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
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

  override componentDidMount() {
    this.addKeydownListener();
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
      isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <div
            className={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={onClose}>
              &times;
            </button>
            {children}
          </div>
        </div>
      ),
      modalContainer,
    );
  }
}
