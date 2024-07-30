import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

import en from './locales/en.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';

i18n.use(initReactI18next).init({
  debug: true,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'translation',
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uk: { translation: uk },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
