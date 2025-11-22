import { FC, lazy, Suspense, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { SuspenseFallback } from '../common/suspense-fallback';

import './router.scss';

const Home = lazy(() =>
  import('@app/home/home.component').then(module => ({
    default: module.Home,
  })),
);

const Upgrades = lazy(() =>
  import('@app/upgrades/upgrades.component').then(module => ({
    default: module.Upgrades,
  })),
);

const Friends = lazy(() =>
  import('@app/friends/friends.component').then(module => ({
    default: module.Friends,
  })),
);

const Tasks = lazy(() =>
  import('@app/tasks/tasks.component').then(module => ({
    default: module.Tasks,
  })),
);

const Stats = lazy(() =>
  import('@app/stats/stats.component').then(module => ({
    default: module.Stats,
  })),
);

type AppRoutesProps = Readonly<{
  onRouteLoadingChange?: (isLoading: boolean) => void;
}>;

const AppRoutes: FC<AppRoutesProps> = ({ onRouteLoadingChange }) => {
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
          <Suspense
            fallback={
              <SuspenseFallback
                ariaLabel="Loading route"
                onShow={() => onRouteLoadingChange?.(true)}
                onHide={() => onRouteLoadingChange?.(false)}
              />
            }
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/upgrades" element={<Upgrades />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </Suspense>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default AppRoutes;
