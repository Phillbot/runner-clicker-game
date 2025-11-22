import { FC, useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useInjection } from 'inversify-react';

import { BalanceStore } from '@app/balance/balance.store';
import { LoadingOverlay } from '@app/loading-overlay/loading-overlay.component';
import { ModalRenderer } from '@app/modals/modal-render.component';
import { NavPanel } from '@app/nav-panel/nav-panel.component';
import AppRoutes from '@app/router/router';
import { container } from '@config/inversify.config';
import { EnvUtils } from '@utils/env';

import styles from './screen-main.module.scss';

export const ScreenMain: FC = () => {
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const balanceStore = useInjection(BalanceStore);
  const [devAmount, setDevAmount] = useState<number>(1_000_000);

  useEffect(() => {
    if (modalContainerRef.current) {
      if (!container.isBound('ModalContainer')) {
        container
          .bind<HTMLDivElement>('ModalContainer')
          .toConstantValue(modalContainerRef.current);
      } else {
        container
          .rebind<HTMLDivElement>('ModalContainer')
          .toConstantValue(modalContainerRef.current);
      }
    }
  }, []);

  return (
    <div className={styles.screenMain}>
      {EnvUtils.isDev && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 9999,
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            padding: '6px 8px',
            background: 'rgba(255,0,0,0.85)',
            color: 'white',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        >
          <input
            type="number"
            value={devAmount}
            min={0}
            onChange={e => setDevAmount(Number(e.target.value) || 0)}
            style={{
              width: '100px',
              padding: '4px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
              color: '#000',
            }}
          />
          <button
            style={{
              padding: '5px 10px',
              background: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onClick={() => balanceStore.incrementBalance(devAmount)}
          >
            DEV: Add
          </button>
        </div>
      )}
      <AppRoutes />
      <NavPanel />
      <div ref={modalContainerRef} />
      <ModalRenderer />
      <LoadingOverlay />
      <ToastContainer />
    </div>
  );
};
