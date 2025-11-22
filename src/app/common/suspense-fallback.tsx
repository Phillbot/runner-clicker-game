import { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

import styles from './suspense-fallback.module.scss';

type Props = Readonly<{
  className?: string;
  ariaLabel?: string;
  onShow?: () => void;
  onHide?: () => void;
  /**
   * Render the overlay through a portal so it isn't affected by parent opacity during transitions.
   */
  portal?: boolean;
}>;

export const SuspenseFallback: FC<Props> = ({
  className,
  ariaLabel = 'Loading',
  onShow,
  onHide,
  portal = true,
}) => {
  useEffect(() => {
    onShow?.();
    return () => {
      onHide?.();
    };
  }, [onHide, onShow]);

  const overlay = (
    <div
      className={classNames(styles.overlay, className)}
      aria-label={ariaLabel}
    >
      <span className={styles.spinner} />
    </div>
  );

  return portal ? createPortal(overlay, document.body) : overlay;
};
