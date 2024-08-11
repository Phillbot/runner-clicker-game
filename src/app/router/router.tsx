import React, { FC, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { Home } from '@app/home/home.component';
import { Upgrades } from '@app/upgrades/upgrades.component';
import { Tasks } from '@app/tasks/tasks.component';
import { Stats } from '@app/stats/stats.component';

import './router.scss';

const AppRoutes: FC = () => {
  const location = useLocation();
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <TransitionGroup className="container">
      <CSSTransition
        key={location.key}
        timeout={300}
        classNames="fade"
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="fade">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upgrades" element={<Upgrades />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default AppRoutes;
