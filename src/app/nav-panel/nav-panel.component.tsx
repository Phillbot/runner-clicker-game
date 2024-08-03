import React, { useState, useEffect, FC } from 'react';
import { Dashboard, Home, ListAlt, Person } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
    icon: <Person />,
  },
  {
    to: '/tasks',
    label: 'Tasks',
    value: '/tasks',
    icon: <ListAlt />,
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
  const navigate = useNavigate();
  const [value, setValue] = useState(location.pathname);
  const [historyCount, setHistoryCount] = useState<number>(0);

  useEffect(() => {
    setValue(location.pathname);
  }, [location]);

  useEffect(() => {
    if (window.Telegram.WebApp) {
      const canGoBack = historyCount > 0;
      canGoBack;
      // temp OFF
      // ? window.Telegram.WebApp.BackButton.show()
      // : window.Telegram.WebApp.BackButton.hide();
    }
  }, [historyCount]);

  useEffect(() => {
    if (window.Telegram.WebApp) {
      const handleBackButtonClick = () => {
        if (historyCount > 0) {
          navigate(-1);
          setHistoryCount(count => count - 1);
        }
      };

      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);

      return () => {
        window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
      };
    }
  }, [navigate, historyCount]);

  return (
    <div className={styles.navPanel}>
      <BottomNavigation
        showLabels={true}
        className={styles.navPanelBottomNavigation}
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          setHistoryCount(count => count + 1); // Увеличиваем счетчик при навигации
        }}
      >
        {links.map(item => (
          <BottomNavigationAction
            className={classNames(styles.navPanelBottomNavigationElement, {
              [styles.navPanelBottomNavigationElementActive]:
                item.value === value,
            })}
            disabled={item.value === value}
            key={item.value}
            component={Link}
            to={item.to}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </div>
  );
};
