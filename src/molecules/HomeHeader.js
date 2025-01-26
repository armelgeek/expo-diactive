import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Text } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { NotificationButton } from './NotificationButton'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { useSteps } from '../hooks/useSteps'
import headerMenu from '../styles/common/headerMenu';
import resources from '../resources/resources';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import UserAccount from './UserAccount'

export const HomeHeader = () => {
	const { theme } = useTheme()
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const { user, isAuthenticated } = useAuth()
	const { points } = useSteps()

	return (
		<View style={[
			styles.container,
			{
				paddingTop: insets.top
			}
		]}>
			<View style={styles.content}>
				<View style={styles.leftSection}>
					{!isAuthenticated ? (
						<UserAccount userIcon={resources.icons.user} username={'Créer un compte'} />
					) : (
						<UserAccount userIcon={resources.icons.user} username={user?.full_name} />
					)}
				</View>

				<View style={styles.rightSection}>
					<View style={headerMenu.badgeCounter}>
						<Text style={headerMenu.diaCount}>
							{points} D
						</Text>
					</View>
					<NotificationButton />
					<ThemeToggle />
					<TouchableOpacity
						style={styles.languageButton}
						onPress={() => navigation.navigate('Language')}
					>
						<Image
							resizeMode="contain"
							width={24}
							height={24}
							source={resources.icons.language}
							style={styles.languageImage}
						/>
					</TouchableOpacity>
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
		gap: 10
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
	languageButton: {
		width: 24,
		height: 24,
	},
	languageImage: {
		width: 24,
		height: 24,
	},
})
