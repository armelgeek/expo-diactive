import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n'

export const useLanguage = () => {
	const { i18n } = useTranslation()
	const [loading, setLoading] = useState(false)

	const changeLanguage = useCallback(async (languageCode) => {
		try {
			setLoading(true)
			await i18n.changeLanguage(languageCode)
		} catch (error) {
			console.error('Error changing language:', error)
		} finally {
			setLoading(false)
		}
	}, [i18n])

	const getCurrentLanguage = useCallback(() => {
		return i18n.language
	}, [i18n])

	const languages = getAvailableLanguages()

	return {
		loading,
		languages,
		currentLanguage: getCurrentLanguage(),
		changeLanguage
	}
}
