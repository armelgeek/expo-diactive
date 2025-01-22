import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Text } from 'react-native-paper'
import { Icon } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import { NotificationButton } from './NotificationButton'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { useSteps } from '../hooks/useSteps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const HomeHeader = () => {
	const { theme } = useTheme()
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const { user } = useAuth()
	const { points } = useSteps()

	return (
		<View style={[
			styles.container,
			{
				backgroundColor: theme.colors.surface,
				paddingTop: insets.top
			}
		]}>
			<View style={styles.content}>
				<View style={styles.leftSection}>
					<TouchableOpacity
						style={styles.profileButton}
						onPress={() => navigation.navigate('Profile')}
					>
						<Image
							source={require('../../assets/avatar.jpg')}
							style={styles.avatar}
						/>
						<Text variant="titleMedium" style={{ color: theme.colors.text }}>
							{user?.user_metadata?.username}
						</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.rightSection}>
					<View style={[styles.pointsContainer, { backgroundColor: theme.colors.background }]}>
						<Text variant="titleMedium" style={{ color: theme.colors.primary }}>
							{points} D
						</Text>
					</View>
					<NotificationButton />
					<ThemeToggle />
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	content: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		height: 56,
	},
	leftSection: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	rightSection: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	profileButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	pointsContainer: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 16,
	},
})
