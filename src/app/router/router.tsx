import { FC, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { Friends } from '@app/friends/friends.component';
import { Home } from '@app/home/home.component';
import { Stats } from '@app/stats/stats.component';
import { Tasks } from '@app/tasks/tasks.component';
import { Upgrades } from '@app/upgrades/upgrades.component';

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
            <Route path="/friends" element={<Friends />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default AppRoutes;
