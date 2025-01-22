import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'

import fr from './locales/fr.json'
import en from './locales/en.json'
import es from './locales/es.json'

const LANGUAGES = {
	fr: { name: 'Français', translation: fr },
	en: { name: 'English', translation: en },
	es: { name: 'Español', translation: es }
}

const languageDetector = {
	type: 'languageDetector',
	async: true,
	detect: async (callback) => {
		try {
			// Récupérer la langue sauvegardée
			const savedLanguage = await AsyncStorage.getItem('user-language')
			if (savedLanguage) {
				return callback(savedLanguage)
			}

			// Utiliser la langue du système par défaut
			const deviceLanguage = Localization.locale.split('-')[0]
			callback(LANGUAGES[deviceLanguage] ? deviceLanguage : 'en')
		} catch (error) {
			console.error('Error reading language:', error)
			callback('en')
		}
	},
	init: () => { },
	cacheUserLanguage: async (language) => {
		try {
			await AsyncStorage.setItem('user-language', language)
		} catch (error) {
			console.error('Error saving language:', error)
		}
	}
}

const i18n = i18next.createInstance()

i18n
	.use(languageDetector)
	.use(initReactI18next)

export const initI18n = () => {
	return i18n.init({
		compatibilityJSON: 'v3',
		resources: LANGUAGES,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false
		},
		react: {
			useSuspense: false // This is important for async loading
		}
	})
}

export const getAvailableLanguages = () => {
	return Object.entries(LANGUAGES).map(([code, { name }]) => ({
		code,
		name
	}))
}

export default i18n
