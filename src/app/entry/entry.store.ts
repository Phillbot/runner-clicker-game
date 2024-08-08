import { injectable, inject } from 'inversify';
import { makeObservable, observable, action, runInAction } from 'mobx';
import axios, { AxiosProgressEvent } from 'axios';

import {
  EnvUtils,
  preloadResourcesWithProgress,
  isDesktop,
} from '@utils/index';
import { GameStore } from '@app/game/game.store';
import { BalanceStore } from '@app/balance/balance.store';
import { EnergyStore } from '@app/energy-bar/energy.store';

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
  @observable
  private _lastLogout: number = 0;

  private readonly _loginDate = new Date().getTime();

  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor(
    @inject(GameStore) private readonly _gameStore: GameStore,
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(EnergyStore) private readonly _energyStore: EnergyStore,
  ) {
    makeObservable(this);
    window.addEventListener('beforeunload', this.syncOnUnload);
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

      const { user } = response.data;
      runInAction(() => {
        this._gameStore.setInitialData(user.balance, user.abilities);
        this._balanceStore.setBalance(user.balance);
        this._lastLogout = user.lastLogout ?? 0;
        this._energyStore.setAvailableEnergy(user.activeEnergy.active_energy);
        this._energyStore.calculateEnergyBasedOnLastLogout(this._lastLogout);
      });
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

  get lastLogout(): number {
    return this._lastLogout;
  }

  readonly syncOnUnload = () => {
    const initData = window.Telegram.WebApp.initData;
    const lastLogoutTimestamp = new Date().getTime();
    const lastLoginTimestamp = this._loginDate;
    const balance = this._balanceStore.balance;
    const activeEnergy = Math.round(this._energyStore.availableEnergyValue);

    try {
      axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/logout`,
        {
          initData,
          balance,
          lastLogoutTimestamp,
          lastLoginTimestamp,
          activeEnergy,
        },
      );
    } catch (error) {
      console.log('logout error');
    }
  };
}
