import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Profile } from '@app/screen-main/profile.component';
import { Stats } from '@app/screen-main/stats.component';
import { Home } from './home/home.component';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/stats" element={<Stats />} />
  </Routes>
);

export default AppRoutes;
