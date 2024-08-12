import React, { useState, useEffect, FC } from 'react';
import classNames from 'classnames';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeOutlined,
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
  const telegram = window.Telegram.WebApp;

  useEffect(() => {
    setValue(location.pathname);
  }, [location]);

  useEffect(() => {
    if (telegram) {
      const canGoBack = historyCount > 0;
      canGoBack ? telegram.BackButton.show() : telegram.BackButton.hide();
    }
  }, [historyCount]);

  useEffect(() => {
    if (telegram) {
      const handleBackButtonClick = () => {
        if (historyCount > 0) {
          navigate(-1);
          setHistoryCount(count => count - 1);
        }
      };

      telegram.BackButton.onClick(handleBackButtonClick);

      return () => {
        telegram.BackButton.offClick(handleBackButtonClick);
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
            key={item.value}
            to={item.to}
            className={classNames(styles.navPanelBottomNavigationElement, {
              [styles.navPanelBottomNavigationElementActive]:
                item.value === value,
              [styles.navPanelBottomNavigationElementDisabled]: item.disabled,
            })}
            draggable={false}
            disabled={item.value === value || item.disabled}
            component={Link}
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
    icon: <SportsEsportsOutlined fontSize="large" />,
    disabled: false,
  },
  {
    to: '/upgrades',
    label: 'Upgrades',
    value: '/upgrades',
    icon: <ExtensionOutlined fontSize="large" />,
    disabled: false,
  },
  {
    to: '/friends',
    label: 'Friends',
    value: '/friends',
    icon: <BadgeOutlined fontSize="large" />,
    disabled: false,
  },
  {
    to: '/tasks',
    label: 'Tasks',
    value: '/tasks',
    icon: <ChecklistOutlined fontSize="large" />,
    disabled: true,
  },
  {
    to: '/stats',
    label: 'Stats',
    value: '/stats',
    icon: <BarChartOutlined fontSize="large" />,
    disabled: true,
  },
];
