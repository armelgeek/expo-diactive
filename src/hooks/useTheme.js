import { useState, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getTheme } from '../theme'

const THEME_STORAGE_KEY = 'app_theme'

export const useTheme = () => {
	const systemColorScheme = useColorScheme()
	const [isDarkMode, setIsDarkMode] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [themePreference, setThemePreference] = useState('system') // 'light', 'dark', or 'system'

	useEffect(() => {
		loadThemePreference()
	}, [])

	useEffect(() => {
		if (themePreference === 'system') {
			setIsDarkMode(systemColorScheme === 'dark')
		}
	}, [systemColorScheme, themePreference])

	const loadThemePreference = async () => {
		try {
			const savedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY)
			if (savedPreference) {
				setThemePreference(savedPreference)
				setIsDarkMode(
					savedPreference === 'system'
						? systemColorScheme === 'dark'
						: savedPreference === 'dark'
				)
			} else {
				setIsDarkMode(systemColorScheme === 'dark')
			}
		} catch (error) {
			console.error('Error loading theme preference:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const setTheme = async (preference) => {
		try {
			await AsyncStorage.setItem(THEME_STORAGE_KEY, preference)
			setThemePreference(preference)
			setIsDarkMode(
				preference === 'system'
					? systemColorScheme === 'dark'
					: preference === 'dark'
			)
		} catch (error) {
			console.error('Error saving theme preference:', error)
		}
	}

	return {
		theme: getTheme(isDarkMode),
		isDarkMode,
		themePreference,
		isLoading,
		setTheme
	}
}
