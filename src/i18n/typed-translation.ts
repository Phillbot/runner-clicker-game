import type { TFunction } from 'i18next';

import i18n from './config';

// Typed wrapper to narrow translation keys to the default namespace.
export const t: TFunction<'translation'> = i18n.t;
