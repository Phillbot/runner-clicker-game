import React, { useState, useEffect, FC } from 'react';
import classNames from 'classnames';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChartOutlined,
  ChecklistOutlined,
  ExtensionOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';

import styles from './nav-panel.md.scss';

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
      canGoBack
        ? window.Telegram.WebApp.BackButton.show()
        : window.Telegram.WebApp.BackButton.hide();
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
          setHistoryCount(count => count + 1);
        }}
      >
        {links.map(item => (
          <BottomNavigationAction
            className={classNames(styles.navPanelBottomNavigationElement, {
              [styles.navPanelBottomNavigationElementActive]:
                item.value === value,
              [styles.navPanelBottomNavigationElementDisabled]: item.disabled,
            })}
            disabled={item.value === value || item.disabled}
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

const links = [
  {
    to: '/',
    label: 'Home',
    value: '/',
    icon: <SportsEsportsOutlined />,
    disabled: false,
  },
  {
    to: '/upgrades',
    label: 'Upgrades',
    value: '/upgrades',
    icon: <ExtensionOutlined />,
    disabled: false,
  },
  {
    to: '/tasks',
    label: 'Tasks',
    value: '/tasks',
    icon: <ChecklistOutlined />,
    disabled: true,
  },
  {
    to: '/stats',
    label: 'Stats',
    value: '/stats',
    icon: <BarChartOutlined />,
    disabled: true,
  },
];
