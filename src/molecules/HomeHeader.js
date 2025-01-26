import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Text } from 'react-native-paper'
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
		gap: 5,
	},
	profileButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	avatar: {
		width: 26,
		height: 26,
		borderRadius: 20,
	},
	pointsContainer: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 16,
	},
})
