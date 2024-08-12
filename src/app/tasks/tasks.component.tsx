import React, { PureComponent, ReactNode } from 'react';

import styles from './tasks.md.scss';

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
