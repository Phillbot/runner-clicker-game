import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as DependencyInjectionProvider } from 'inversify-react';

import { Entry } from '@app/entry/entry.component';
import { container } from '@common/IoC/container';

import '@styles/reset.scss';
import '@styles/styles.scss';

import 'reflect-metadata';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <DependencyInjectionProvider container={container}>
      <Entry />
    </DependencyInjectionProvider>
  </React.StrictMode>
);
