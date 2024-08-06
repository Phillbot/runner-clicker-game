import { Container } from 'inversify';

import { EntryStore } from '@app/entry/entry.store';
import { GameStore } from '@app/game/game.store';
import { BoostStore } from '@app/boost-button/boost-button.store';
import { BalanceStore } from '@app/balance/balance.store';

export const container = new Container({ defaultScope: 'Singleton' });

container.bind<EntryStore>(EntryStore).toSelf();
container.bind<GameStore>(GameStore).toSelf();
container.bind<BoostStore>(BoostStore).toSelf();
container.bind<BalanceStore>(BalanceStore).toSelf();
