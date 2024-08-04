import { makeObservable, observable, action } from 'mobx';
import { injectable } from 'inversify';
import axios from 'axios';

import { preloadResourcesWithProgress } from '@common/utils/preload-resources';
import {
  isDesktop,
  isProd,
  REACT_CLICKER_APP_BASE_URL,
} from '@common/utils/utils';
import FontFaceObserver from 'fontfaceobserver';

@injectable()
export class EntryStore {
  @observable
  isLoading: boolean = true;
  @observable
  isAuthorized: boolean = false;
  @observable
  resourcesLoaded: boolean = false;
  @observable
  loadProgress: number = 0;
  @observable
  serverLoadProgress: number = 0;
  @observable
  resourcesLoadProgress: number = 0;

  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor() {
    makeObservable(this);
  }

  @action async initialize() {
    if (this._telegram) {
      this._telegram.setHeaderColor('#1d2256');
      this._telegram.ready();
      this._telegram.disableVerticalSwipes();
      this._telegram.expand();
      this._telegram.isClosingConfirmationEnabled = true;
    }
    await this.checkAuth();
  }

  @action private async checkAuth() {
    const initData = window.Telegram.WebApp.initData;

    try {
      await this.loadServerData(initData);
      await this.loadResources();
      await this.loadFonts();
      this.isLoading = false;
      this.isAuthorized = true;
    } catch (error) {
      this.handleUnauthorized();
    }
  }

  @action private async loadServerData(initData: string) {
    const updateProgress = (progress: number) => {
      this.serverLoadProgress = progress;
      this.updateCombinedProgress();
    };

    const response = await axios.post(
      `${REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/getMe`,
      { initData },
      {
        onDownloadProgress: progressEvent => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            updateProgress(progress);
          }
        },
      },
    );

    if (!response.data.ok) {
      throw new Error('Unauthorized');
    }
  }

  @action private async loadResources(): Promise<void> {
    try {
      await preloadResourcesWithProgress(this.resources, (progress: number) => {
        this.resourcesLoadProgress = progress;
        this.updateCombinedProgress();
      });
      this.resourcesLoaded = true;
    } catch (error) {
      console.error('Resource preloading failed', error);
      this.resourcesLoaded = true;
    }
  }

  @action private updateCombinedProgress() {
    const totalProgress =
      (this.serverLoadProgress + this.resourcesLoadProgress) / 2;
    this.loadProgress = totalProgress;
  }

  @action private handleUnauthorized() {
    if (this._telegram) {
      this._telegram.close();
    }
    this.isLoading = false;
    this.isAuthorized = false;
  }

  private async loadFonts() {
    const fonts = [
      new FontFaceObserver('OverdoseSans'),
      new FontFaceObserver('Rubik'),
      new FontFaceObserver('PressStart'),
    ];
    await Promise.all(fonts.map(font => font.load()));
    document.body.classList.add('fonts-loaded');
  }

  // TODO: we need it?
  private get resources(): string[] {
    return [
      '/assets/fonts/overdozesans.woff2',
      '/assets/fonts/rubik.woff2',
      '/assets/fonts/press-start.woff2',
    ];
  }

  get telegram(): WebApp {
    return this._telegram;
  }

  get isUnsupportedScreen(): boolean {
    const isUnsupportedScreen = isProd() && isDesktop();
    return isUnsupportedScreen;
  }
}
