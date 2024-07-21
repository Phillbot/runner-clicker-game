import 'reflect-metadata';
import './reset.scss';

import { container } from '@common/IoC/container';
import { Provider as DependencyInjectionProvider } from 'inversify-react';
import React from 'react';
import { BrowserView, MobileOnlyView } from 'react-device-detect';
import ReactDOM from 'react-dom/client';

import { Unsupported } from './app/unsupported/unsupported.component';

const tg = window.Telegram.WebApp;
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <DependencyInjectionProvider container={container}>
      <MobileOnlyView>{tg.platform}</MobileOnlyView>
      <BrowserView>
        {tg.platform}
        <Unsupported />
      </BrowserView>
    </DependencyInjectionProvider>
  </React.StrictMode>
);
