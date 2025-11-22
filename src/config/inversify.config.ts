import { Container } from 'inversify';

import { BalanceStore } from '@app/balance/balance.store';
import { BoostStore } from '@app/boost-button/boost-button.store';
import { ApiClient } from '@app/common/api-client';
import { Scheduler } from '@app/common/scheduler';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { EntryStore } from '@app/entry/entry.store';
import { EntryApi } from '@app/entry/services/entry-api';
import { ResourceLoader } from '@app/entry/services/resource-loader';
import { TelegramService } from '@app/entry/services/telegram.service';
import { StartupCoordinator } from '@app/entry/startup-coordinator';
import { FriendsStore } from '@app/friends/friends.store';
import { GameStore } from '@app/game/game.store';
import { LoadingOverlayStore } from '@app/loading-overlay/loading-overlay.store';
import { ModalFactory } from '@app/modals/modal-factory';
import { ModalsStore } from '@app/modals/modals.store';
import { IModalFactory } from '@app/modals/types';
import { UpgradesStore } from '@app/upgrades/upgrades.store';

export const container = new Container({ defaultScope: 'Singleton' });

container.bind<EntryStore>(EntryStore).toSelf();
container.bind<GameStore>(GameStore).toSelf();
container.bind<BoostStore>(BoostStore).toSelf();
container.bind<BalanceStore>(BalanceStore).toSelf();
container.bind<EnergyStore>(EnergyStore).toSelf();
container.bind<ModalsStore>(ModalsStore).toSelf();
container.bind<UpgradesStore>(UpgradesStore).toSelf();
container.bind<FriendsStore>(FriendsStore).toSelf();
container.bind<LoadingOverlayStore>(LoadingOverlayStore).toSelf();
container.bind<ResourceLoader>(ResourceLoader).toSelf();
container.bind<EntryApi>(EntryApi).toSelf();
container.bind<TelegramService>(TelegramService).toSelf();
container.bind<StartupCoordinator>(StartupCoordinator).toSelf();
container.bind<ApiClient>(ApiClient).toSelf();
container.bind<Scheduler>(Scheduler).toSelf();

container.bind<IModalFactory>('IModalFactory').to(ModalFactory);
