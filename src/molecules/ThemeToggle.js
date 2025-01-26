import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'
import { Menu } from 'react-native-paper'
import { useTheme } from '../context/ThemeContext'
import { AppColors } from '../theme'

export const ThemeToggle = () => {
	const { theme, themePreference, setTheme } = useTheme()
	const [menuVisible, setMenuVisible] = React.useState(false)

	const getThemeIcon = () => {
		switch (themePreference) {
			case 'light':
				return 'brightness-5'
			case 'dark':
				return 'brightness-2'
			default:
				return 'brightness-auto'
		}
	}

	return (
		<Menu
			visible={menuVisible}
			onDismiss={() => setMenuVisible(false)}
			anchor={
				<TouchableOpacity
					style={[styles.container, { backgroundColor: theme.colors.surface }]}
					onPress={() => setMenuVisible(true)}
				>
					<Icon
						name={getThemeIcon()}
						type="material"
						size={24}
						color={AppColors.danger}
					/>
				</TouchableOpacity>
			}
		>
			<Menu.Item
				leadingIcon="brightness-5"
				onPress={() => {
					setTheme('light')
					setMenuVisible(false)
				}}
				title="Mode clair"
			/>
			<Menu.Item
				leadingIcon="brightness-2"
				onPress={() => {
					setTheme('dark')
					setMenuVisible(false)
				}}
				title="Mode sombre"
			/>
			<Menu.Item
				leadingIcon="brightness-auto"
				onPress={() => {
					setTheme('system')
					setMenuVisible(false)
				}}
				title="Système"
			/>
		</Menu>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		borderRadius: 20,
	},
})
