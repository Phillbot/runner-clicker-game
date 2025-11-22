import { inject, injectable } from 'inversify';

import { BalanceStore } from '@app/balance/balance.store';
import { BoostStore } from '@app/boost-button/boost-button.store';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { FriendsStore } from '@app/friends/friends.store';
import { GameStore } from '@app/game/game.store';
import { UpgradesStore } from '@app/upgrades/upgrades.store';
import { EnvUtils, isDesktop } from '@utils';

import { EntryApi } from './services/entry-api';
import { ResourceLoader } from './services/resource-loader';
import { TelegramService } from './services/telegram.service';
import type { Bot, User, UserStatus } from './types';

type Setters = Readonly<{
  setLoading: (value: boolean) => void;
  setAuthorized: (value: boolean) => void;
  setResourcesLoaded: (value: boolean) => void;
  setLoadProgress: (value: number) => void;
  setUserStatus: (value: UserStatus) => void;
}>;

@injectable()
export class StartupCoordinator {
  private _serverProgress = 0;
  private _resourcesProgress = 0;

  constructor(
    @inject(GameStore) private readonly _gameStore: GameStore,
    @inject(BalanceStore) private readonly _balanceStore: BalanceStore,
    @inject(EnergyStore) private readonly _energyStore: EnergyStore,
    @inject(BoostStore) private readonly _boostStore: BoostStore,
    @inject(FriendsStore) private readonly _friendsStore: FriendsStore,
    @inject(UpgradesStore) private readonly _upgradesStore: UpgradesStore,
    @inject(ResourceLoader) private readonly _resourceLoader: ResourceLoader,
    @inject(EntryApi) private readonly _entryApi: EntryApi,
    @inject(TelegramService)
    private readonly _telegramService: TelegramService,
  ) {}

  async run(setters: Setters): Promise<void> {
    const { setAuthorized, setLoading } = setters;

    if (EnvUtils.isDev && EnvUtils.enableMock) {
      this.initializeMockUser(setters);
      this._energyStore.startRegeneration();
      setLoading(false);
      await this.preloadResources(setters);
      return;
    }

    this._telegramService.setup();

    await this.checkAuth(setters);
    setAuthorized(true);
    this.updateLastLogin();
    this._energyStore.startRegeneration();
    this._energyStore.startSyncWithServer();
    await this.preloadResources(setters);
    setLoading(false);
  }

  get isUnsupportedScreen(): boolean {
    const platform = this._telegramService.platform;
    const isWebA = platform === 'weba';
    return EnvUtils.avoidUnsupportedScreen ? false : isDesktop() || isWebA;
  }

  disableClosingConfirmation(): void {
    this._telegramService.disableClosingConfirmation();
  }

  get telegram(): WebApp | undefined {
    return this._telegramService.webApp;
  }

  private async checkAuth(setters: Setters): Promise<void> {
    const initData = this._telegramService.initData;
    try {
      await this.loadServerData(initData, setters);
    } catch (error) {
      await this.handleAuthError(error, initData, setters);
    }
  }

  private async loadServerData(
    initData: string,
    setters: Setters,
  ): Promise<void> {
    const updateProgress = (progress: number) => {
      this._serverProgress = progress;
      this.updateCombinedProgress(setters);
    };

    const { user, bot } = await this._entryApi.fetchUser(initData, progress =>
      updateProgress(progress),
    );
    this.initializeUser(user, bot, setters);
  }

  private async preloadResources(setters: Setters): Promise<void> {
    const updateProgress = (progress: number) => {
      this._resourcesProgress = progress;
      this.updateCombinedProgress(setters);
      if (progress === 100) {
        setters.setResourcesLoaded(true);
      }
    };

    await this._resourceLoader.load(this.imageUrls, this.fontNames, progress =>
      updateProgress(progress),
    );
  }

  private updateCombinedProgress(setters: Setters): void {
    const combined = (this._serverProgress + this._resourcesProgress) / 2;
    setters.setLoadProgress(combined);
  }

  private async handleAuthError(
    error: unknown,
    initData: string,
    setters: Setters,
  ): Promise<void> {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;

    if (status === 404) {
      try {
        const { user, bot } = await this._entryApi.createUser(
          initData,
          this._telegramService.referralParam,
        );
        this.initializeUser(user, bot, setters);
        return;
      } catch (creationError) {
        console.error('Failed to create user:', creationError);
        this._telegramService.close();
        return;
      }
    }

    if (status === 401 || status === 403) {
      this._telegramService.close();
      return;
    }

    console.error('Authorization failed', error);
    throw error;
  }

  private initializeUser(user: User, bot: Bot, setters: Setters): void {
    setters.setUserStatus(user.status);
    this._upgradesStore.setUserId(user.id);
    this._gameStore.setInitialData(user.abilities);

    this._balanceStore.setBalance(user.balance);
    this._energyStore.setAvailableEnergy(
      user.activeEnergy?.availablePoints ?? 0,
    );
    this._boostStore.setInitialBoostData(user.boost?.lastBoostRun ?? 0);
    this._friendsStore.setRefLink(bot.username, user?.id);
    this._friendsStore.setFriendsList(user.referrals ?? []);

    setters.setAuthorized(true);
  }

  private initializeMockUser(setters: Setters): void {
    const mockUser: User = {
      id: 123456789,
      isBot: false,
      firstName: 'Test',
      lastName: 'User',
      userName: 'testuser',
      languageCode: 'en',
      isPremium: false,
      status: 1,
      balance: 10000,
      abilities: {
        clickCoastLevel: 1,
        energyLevel: 1,
        energyRegenirationLevel: 1,
      },
      activeEnergy: {
        availablePoints: 500,
      },
      boost: {
        lastBoostRun: 0,
      },
      referrals: [],
    };

    const mockBot: Bot = {
      id: 987654321,
      isBot: true,
      firstName: 'Test Bot',
      username: 'test_bot',
      canConnectToBusiness: false,
      canJoinGroups: true,
      canReadAllGroupMessages: false,
      supportsInlineQueries: false,
    };

    this.initializeUser(mockUser, mockBot, setters);
  }

  private updateLastLogin(): void {
    const initData = this._telegramService.initData;
    this._entryApi.updateLastLogin(initData);
  }

  private get imageUrls(): string[] {
    return [
      // require('../../images/test.jpg')
    ];
  }

  private get fontNames(): string[] {
    return ['OverdoseSans', 'Rubik', 'PressStart'];
  }
}
