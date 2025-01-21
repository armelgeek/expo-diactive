import i18n from 'i18next'
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

const LANGUAGE_DETECTOR = {
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

i18n
	.use(LANGUAGE_DETECTOR)
	.use(initReactI18next)
	.init({
		compatibilityJSON: 'v3',
		resources: LANGUAGES,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false
		}
	})

export const getAvailableLanguages = () => {
	return Object.entries(LANGUAGES).map(([code, { name }]) => ({
		code,
		name
	}))
}

export default i18n
