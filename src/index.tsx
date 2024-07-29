import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as DependencyInjectionProvider } from 'inversify-react';
import 'reflect-metadata';

import { Entry } from '@app/entry/entry.component';
import { container } from '@common/IoC/container';

import '@styles/reset.scss';
import '@styles/styles.scss';

import './i18n/i18n';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <DependencyInjectionProvider container={container}>
      <Entry />
    </DependencyInjectionProvider>
  </React.StrictMode>,
);
