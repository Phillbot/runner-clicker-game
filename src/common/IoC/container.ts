import { Container } from 'inversify';

import { GameStore } from '@app/game/game.store';

export const container = new Container({ defaultScope: 'Singleton' });

container.bind<GameStore>(GameStore).toSelf();
