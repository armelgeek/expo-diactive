import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { I18nextProvider } from 'react-i18next'
import i18n, { initI18n } from '../i18n'

export const I18nProvider = ({ children }) => {
	const [isInitialized, setIsInitialized] = useState(false)

	useEffect(() => {
		const init = async () => {
			try {
				await initI18n()
				setIsInitialized(true)
			} catch (error) {
				console.error('Error initializing i18n:', error)
				setIsInitialized(true) // Continue with fallback language
			}
		}
		init()
	}, [])

	if (!isInitialized) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		)
	}

	return (
		<I18nextProvider i18n={i18n}>
			{children}
		</I18nextProvider>
	)
}
