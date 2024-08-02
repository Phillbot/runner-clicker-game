import { Container } from 'inversify';

import { GameStore } from '@app/game/game.store';
import { BoostStore } from '@app/boost-button/boost-button.store';

export const container = new Container({ defaultScope: 'Singleton' });

container.bind<GameStore>(GameStore).toSelf();
container.bind<BoostStore>(BoostStore).toSelf();
