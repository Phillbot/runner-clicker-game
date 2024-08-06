import React, { useRef, useEffect } from 'react';
import { NavPanel } from '@app/nav-panel/nav-panel.component';
import AppRoutes from '@app/router/router';
import { container } from '@config/inversify.config';
import { ModalRenderer } from '@app/modals/modal-render.component';

import styles from './screen-main.md.scss';

export const ScreenMain: React.FC = () => {
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalContainerRef.current) {
      container
        .bind<HTMLDivElement>('ModalContainer')
        .toConstantValue(modalContainerRef.current);
    }
  }, []);

  return (
    <div className={styles.screenMain}>
      <AppRoutes />
      <NavPanel />
      <div ref={modalContainerRef}></div>
      <ModalRenderer />
    </div>
  );
};
