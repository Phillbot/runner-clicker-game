import { Container } from 'inversify';

import { EntryStore } from '@app/entry/entry.store';
import { GameStore } from '@app/game/game.store';
import { BoostStore } from '@app/boost-button/boost-button.store';
import { BalanceStore } from '@app/balance/balance.store';
import { ModalsStore } from '@app/modals/modals.store';
import { ModalFactory } from '@app/modals/modal-factory';
import { IModalFactory } from '@app/modals/types';
import { EnergyStore } from '@app/energy-bar/energy.store';
import { UpgradesStore } from '@app/upgrades/upgrades.store';
import { LoadingOverlayStore } from '@app/loading-overlay/loading-overlay.store';
import { FriendsStore } from '@app/friends/friends.store';

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

container.bind<IModalFactory>('IModalFactory').to(ModalFactory);
