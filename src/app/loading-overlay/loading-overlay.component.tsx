import React, { Component, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CircularProgress } from '@mui/material';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { LoadingOverlayStore } from './loading-overlay.store';

import styles from './loading-overlay.md.scss';

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
