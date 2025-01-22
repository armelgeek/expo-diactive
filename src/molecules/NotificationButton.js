import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Badge } from 'react-native-paper'
import { Icon } from 'react-native-elements'
import { useNotifications } from '../hooks/useNotifications'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../context/ThemeContext'

export const NotificationButton = () => {
	const { unreadCount } = useNotifications()
	const navigation = useNavigation()
	const { theme, isDarkMode, setTheme } = useTheme()

	return (
		<TouchableOpacity
			style={[styles.container, { backgroundColor: theme.colors.surface }]}
			onPress={() => navigation.navigate('Notifications')}
		>
			<Icon
				name="notifications"
				type="material"
				size={24}
				color={theme.colors.primary}
			/>
			{unreadCount > 0 && (
				<Badge
					size={16}
					style={[styles.badge, { backgroundColor: theme.colors.error }]}
				>
					{unreadCount > 99 ? '99+' : unreadCount}
				</Badge>
			)}
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 8,
		marginRight: 8,
		position: 'relative',
		borderRadius: 20,
	},
	badge: {
		position: 'absolute',
		top: 0,
		right: 0,
	},
})
