import { Component, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CircularProgress } from '@mui/material';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';

import { LoadingOverlayStore } from './loading-overlay.store';

import styles from './loading-overlay.module.scss';

@observer
export class LoadingOverlay extends Component {
  @resolve
  private declare readonly _loadingOverlayStore: LoadingOverlayStore;

  override render(): ReactNode {
    if (!this._loadingOverlayStore.isLoading) {
      return null;
    }

    return createPortal(
      <div className={styles.loadingOverlay}>
        <CircularProgress size={80} color="primary" />
      </div>,
      document.body,
    );
  }
}
