import { PureComponent, ReactNode } from 'react';

import styles from './tasks.module.scss';

export class Tasks extends PureComponent {
  override render(): ReactNode {
    return (
      <div className={styles.tasks}>
        <div className={styles.tasksTitle}>
          <span>Tasks</span>
        </div>
      </div>
    );
  }
}
