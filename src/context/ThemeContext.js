import React, { createContext, useContext } from 'react'
import { useTheme as useThemeHook } from '../hooks/useTheme'
import { PaperProvider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
	const themeContext = useThemeHook()
	const { theme } = themeContext

	return (
		<ThemeContext.Provider value={themeContext}>
			<PaperProvider theme={theme}>
				<NavigationContainer theme={theme}>
					{children}
				</NavigationContainer>
			</PaperProvider>
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
