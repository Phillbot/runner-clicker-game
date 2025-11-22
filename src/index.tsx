import 'reflect-metadata';
import './i18n/config';

import { createRoot } from 'react-dom/client';
import { Provider as DependencyInjectionProvider } from 'inversify-react';

import { Entry } from '@app/entry/entry.component';
import { container } from '@config/inversify.config';
import { EnvUtils } from '@utils/env';

import { mockTelegramEnv } from './mock-telegram';

import '@styles/reset.scss';
import '@styles/styles.scss';
import 'rc-tooltip/assets/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';

const rootElement = document.getElementById('root');

const modalContainer = document.createElement('div');
modalContainer.id = 'modal-container';
document.body.appendChild(modalContainer);

if (EnvUtils.isDev && EnvUtils.enableMock) {
  mockTelegramEnv();
}

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
