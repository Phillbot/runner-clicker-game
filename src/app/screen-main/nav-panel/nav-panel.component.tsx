import React, { useState, useEffect, FC } from 'react';
import { Dashboard, Home, Man } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import styles from './nav-panel.md.scss';
import classNames from 'classnames';

const links = [
  {
    to: '/',
    label: 'Home',
    value: '/',
    icon: <Home />,
  },
  {
    to: '/profile',
    label: 'Profile',
    value: '/profile',
    icon: <Man />,
  },
  {
    to: '/stats',
    label: 'Stats',
    value: '/stats',
    icon: <Dashboard />,
  },
];

export const NavPanel: FC = () => {
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);

  useEffect(() => {
    setValue(location.pathname);
  }, [location]);

  return (
    <Paper className={styles.navPanel} elevation={3}>
      <BottomNavigation
        showLabels={true}
        className={styles.navPanelBottomNavigation}
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
        }}
      >
        {links.map(item => (
          <BottomNavigationAction
            className={classNames(styles.navPanelBottomNavigationElement, {
              [styles.navPanelBottomNavigationElementActive]:
                item.value === value,
            })}
            key={item.value}
            component={Link}
            to={item.to}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
