import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import zh from './zh'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: localStorage.getItem('tmb-lang') || 'en', // default English
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

// Persist language choice
i18n.on('languageChanged', (lang) => {
  localStorage.setItem('tmb-lang', lang)
})

export default i18n
