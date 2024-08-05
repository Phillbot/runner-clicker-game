import { injectable } from 'inversify';
import { makeObservable, observable, action } from 'mobx';
import axios, { AxiosProgressEvent } from 'axios';

import { preloadResourcesWithProgress } from '@common/utils/preload-resources';
import { EnvUtils } from '@common/utils/env.utils';
import { isDesktop } from '@common/utils/common.utils';

@injectable()
export class EntryStore {
  @observable
  private _isLoading: boolean = true;
  @observable
  private _isAuthorized: boolean = false;
  @observable
  private _resourcesLoaded: boolean = false;
  @observable
  private _loadProgress: number = 0;
  @observable
  private _serverLoadProgress: number = 0;
  @observable
  private _resourcesLoadProgress: number = 0;

  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor() {
    makeObservable(this);
  }

  @action
  async initialize() {
    if (EnvUtils.avoidTelegramAuth) {
      this.setAuthorized(true);
      this.setLoading(false);
      await this.loadResources();
      return;
    }

    if (this._telegram) {
      this._telegram.setHeaderColor('#1d2256');
      this._telegram.ready();
      this._telegram.disableVerticalSwipes();
      this._telegram.expand();
      this._telegram.isClosingConfirmationEnabled = true;
    }

    await this.checkAuth();
  }

  @action
  private async checkAuth() {
    const initData = window.Telegram.WebApp.initData;

    try {
      await this.loadServerData(initData);
      this.setAuthorized(true);
    } catch (error) {
      console.error('Authorization failed', error);
      this.setAuthorized(false);

      if (this._telegram) {
        this._telegram.close();
      }
    } finally {
      await this.loadResources();
      this.setLoading(false);
    }
  }

  @action
  private async loadServerData(initData: string) {
    const updateProgress = (progress: number) => {
      this.setServerLoadProgress(progress);
      this.updateCombinedProgress();
    };

    try {
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/getMe`,
        { initData },
        {
          onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            updateProgress(progress);
          },
        },
      );

      if (!response.data.ok) {
        throw new Error('Unauthorized');
      }
    } catch (error) {
      console.error('Failed to load server data', error);
      throw error;
    }
  }

  @action
  private async loadResources(): Promise<void> {
    const imageUrls = this.imageUrls;
    const fontNames = this.fontNames;

    const updateProgress = (progress: number) => {
      this.setResourcesLoadProgress(progress);
      this.updateCombinedProgress();
    };

    try {
      await preloadResourcesWithProgress(imageUrls, fontNames, updateProgress);
      this.setResourcesLoaded(true);
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    } catch (error) {
      console.error('Resource preloading failed', error);
      this.setResourcesLoaded(true);
    }
  }

  @action
  private updateCombinedProgress() {
    const totalProgress =
      (this._serverLoadProgress + this._resourcesLoadProgress) / 2;
    this.setLoadProgress(totalProgress);
  }

  private get imageUrls(): string[] {
    return [
      // require('../../images/test.jpg') // example
    ];
  }

  private get fontNames(): string[] {
    return ['OverdoseSans', 'Rubik', 'PressStart'];
  }

  get telegram(): WebApp {
    return this._telegram;
  }

  get isUnsupportedScreen(): boolean {
    return EnvUtils.avoidUnsupportedScreen ? false : isDesktop();
  }

  @action
  setLoading(value: boolean) {
    this._isLoading = value;
  }

  @action
  setAuthorized(value: boolean) {
    this._isAuthorized = value;
  }

  @action
  private setResourcesLoaded(value: boolean) {
    this._resourcesLoaded = value;
  }

  @action
  private setLoadProgress(value: number) {
    this._loadProgress = value;
  }

  @action
  private setServerLoadProgress(value: number) {
    this._serverLoadProgress = value;
  }

  @action
  private setResourcesLoadProgress(value: number) {
    this._resourcesLoadProgress = value;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isAuthorized(): boolean {
    return this._isAuthorized;
  }

  get resourcesLoaded(): boolean {
    return this._resourcesLoaded;
  }

  get loadProgress(): number {
    return this._loadProgress;
  }

  get serverLoadProgress(): number {
    return this._serverLoadProgress;
  }

  get resourcesLoadProgress(): number {
    return this._resourcesLoadProgress;
  }
}
