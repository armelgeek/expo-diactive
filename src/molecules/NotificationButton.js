import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Badge, useTheme } from 'react-native-paper'
import { Icon } from 'react-native-elements'
import { useNotifications } from '../hooks/useNotifications'
import { useNavigation } from '@react-navigation/native'

export const NotificationButton = () => {
	const { unreadCount } = useNotifications()
	const navigation = useNavigation()
	const theme = useTheme()

	return (
		<TouchableOpacity
			style={styles.container}
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
					style={[styles.badge, { backgroundColor: theme.colors.notification }]}
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
	},
	badge: {
		position: 'absolute',
		top: 2,
		right: 2,
	},
})
