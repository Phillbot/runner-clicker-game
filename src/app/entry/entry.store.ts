import { injectable, inject } from 'inversify';
import { makeObservable, observable, action, computed } from 'mobx';
import axios, { AxiosProgressEvent } from 'axios';

import {
  EnvUtils,
  preloadResourcesWithProgress,
  isDesktop,
} from '@utils/index';
import { GameStore } from '@app/game/game.store';
import { BalanceStore } from '@app/balance/balance.store';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { BoostStore } from '@app/boost-button/boost-button.store';
import { FriendsStore } from '@app/friends/friends.store';
import { UpgradesStore } from '@app/upgrades/upgrades.store';

import type { UserStatus, User, Bot } from './types';

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
  private _userStatus: UserStatus = 1;
  private readonly _telegram: WebApp = window.Telegram.WebApp;

  constructor(
    @inject(GameStore) private readonly _gameStore: GameStore,
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(EnergyStore) private readonly _energyStore: EnergyStore,
    @inject(BoostStore) private readonly _boostStore: BoostStore,
    @inject(FriendsStore) private readonly _friendsStore: FriendsStore,
    @inject(UpgradesStore) private readonly _upgradesStore: UpgradesStore,
  ) {
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

    await this.setupTelegramWebApp();

    await this.checkAuth();
  }

  @action
  private setupTelegramWebApp() {
    if (this._telegram) {
      this._telegram.setHeaderColor('#1d2256');
      this._telegram.ready();
      this._telegram.disableVerticalSwipes();
      this._telegram.expand();
      this._telegram.disableClosingConfirmation();
    }
  }

  @action
  private async checkAuth() {
    const initData = window.Telegram.WebApp.initData;

    try {
      await this.loadServerData(initData);
      this.setAuthorized(true);

      this.updateLastLogin();
      this._energyStore.startRegeneration();
      this._energyStore.startSyncWithServer();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          try {
            const createUserResponse = await axios.post(
              `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/create-user`,
              {
                initData,
                referralId:
                  window.Telegram.WebApp.initDataUnsafe.start_param ??
                  undefined,
              },
            );

            if (!createUserResponse.data.ok) {
              throw new Error('Failed to create user');
            }

            const { user, bot } = createUserResponse.data;
            this.initializeUser(user, bot);
          } catch (creationError) {
            console.error('Failed to create user:', creationError);
            if (this._telegram) {
              this._telegram.close();
            }
          }
        } else if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          this._telegram.close();
        } else {
          console.error('Authorization failed', error);
          throw error;
        }
      }
    } finally {
      await this.loadResources();
      this.setLoading(false);
    }
  }

  @action
  private initializeUser(user: User, bot: Bot) {
    this.setUserStatus(user.status);
    this._upgradesStore.setUserId(user.id);
    this._gameStore.setInitialData(user.abilities);

    this._balanceStore.setBalance(user.balance);
    this._energyStore.setAvailableEnergy(
      user.activeEnergy?.availablePoints ?? 0,
    );
    this._boostStore.setInitialBoostData(user.boost?.lastBoostRun ?? 0);
    this._friendsStore.setRefLink(bot.username, user?.id);
    this._friendsStore.setFriendsList(user.referrals ?? []);

    this.setAuthorized(true);
  }

  @action
  private async loadServerData(initData: string) {
    const updateProgress = (progress: number) => {
      this.setServerLoadProgress(progress);
      this.updateCombinedProgress();
    };

    try {
      const response = await axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/get-me`,
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

      const { user, bot } = response.data;
      this.initializeUser(user, bot);
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
      // require('../../images/test.jpg')
    ];
  }

  private get fontNames(): string[] {
    return ['OverdoseSans', 'Rubik', 'PressStart'];
  }

  get telegram(): WebApp {
    return this._telegram;
  }

  @computed
  get isUnsupportedScreen(): boolean {
    const isWebA = this.telegram && this._telegram.platform === 'weba';
    return EnvUtils.avoidUnsupportedScreen ? false : isDesktop() || isWebA;
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

  @action
  private setUserStatus(value: UserStatus) {
    this._userStatus = value;
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

  get userStatus(): UserStatus {
    return this._userStatus;
  }

  private readonly updateLastLogin = () => {
    const initData = window.Telegram.WebApp.initData;

    try {
      axios.post(
        `${EnvUtils.REACT_CLICKER_APP_BASE_URL}/react-clicker-bot/update-last-login`,
        {
          initData,
          lastLogin: Date.now(),
        },
      );
    } catch (error) {
      console.log('logout error');
    }
  };
}
