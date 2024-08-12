import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as DependencyInjectionProvider } from 'inversify-react';

import { Entry } from '@app/entry/entry.component';
import { container } from '@config/inversify.config';

import './i18n/config';

import '@styles/reset.scss';
import '@styles/styles.scss';
import 'rc-tooltip/assets/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';

const rootElement = document.getElementById('root');

const modalContainer = document.createElement('div');
modalContainer.id = 'modal-container';
document.body.appendChild(modalContainer);

const App = (
  <DependencyInjectionProvider container={container}>
    <Entry />
  </DependencyInjectionProvider>
);

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(App);
}

container
  .bind<HTMLDivElement>('ModalContainer')
  .toConstantValue(modalContainer);
