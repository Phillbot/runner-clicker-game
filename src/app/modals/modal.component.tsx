import { Component, createRef, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import styles from './modal.module.scss';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export class Modal extends Component<ModalProps> {
  private destroy$ = new Subject<void>();
  private modalContainer: HTMLElement | null = null;
  private modalRef = createRef<HTMLDivElement>();

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
      <CSSTransition
        in={isOpen}
        timeout={200}
        classNames={{
          enter: styles.modalEnter,
          enterActive: styles.modalEnterActive,
          exit: styles.modalExit,
          exitActive: styles.modalExitActive,
        }}
        mountOnEnter
        unmountOnExit
        nodeRef={this.modalRef}
      >
        <div ref={this.modalRef} className={styles.modalRoot}>
          <div className={styles.modalOverlay} onClick={onClose} />
          <div
            className={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={onClose}>
              &times;
            </button>
            <div className={styles.modalContentScrollable}>{children}</div>
          </div>
        </div>
      </CSSTransition>,
      modalContainer,
    );
  }
}
