import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Avatar, ProgressBar } from 'react-native-paper'
import { useGamification } from '../hooks/useGamification'
import { useTheme } from '../context/ThemeContext'

export const BadgesList = () => {
	const { badges, availableBadges, loading } = useGamification()
	const { theme } = useTheme()

	const renderBadge = (badge, earned = false) => {
		const progress = earned ? 1 : 0
		return (
			<Card
				key={badge.id}
				style={[
					styles.badgeCard,
					{ backgroundColor: theme.colors.surface }
				]}
			>
				<Card.Content style={styles.badgeContent}>
					<Avatar.Icon
						size={48}
						icon={badge.icon_url || 'star'}
						style={{
							backgroundColor: earned ? theme.colors.primary : theme.colors.disabled
						}}
					/>
					<View style={styles.badgeInfo}>
						<Text variant="titleMedium" style={{ color: theme.colors.text }}>
							{badge.name}
						</Text>
						<Text variant="bodySmall" style={{ color: theme.colors.text }}>
							{badge.description}
						</Text>
						<ProgressBar
							progress={progress}
							color={theme.colors.primary}
							style={styles.progressBar}
						/>
					</View>
				</Card.Content>
			</Card>
		)
	}

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Chargement des badges...</Text>
			</View>
		)
	}

	return (
		<ScrollView style={styles.container}>
			<Text variant="titleLarge" style={[styles.section, { color: theme.colors.text }]}>
				Badges obtenus ({badges.length})
			</Text>
			{badges.map(badge => renderBadge(badge.badge, true))}

			<Text variant="titleLarge" style={[styles.section, { color: theme.colors.text }]}>
				Badges disponibles ({availableBadges.length - badges.length})
			</Text>
			{availableBadges
				.filter(badge => !badges.find(b => b.badge_id === badge.id))
				.map(badge => renderBadge(badge))}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	section: {
		marginBottom: 16,
	},
	badgeCard: {
		marginBottom: 12,
		elevation: 2,
	},
	badgeContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	badgeInfo: {
		flex: 1,
		marginLeft: 16,
	},
	progressBar: {
		marginTop: 8,
		height: 4,
		borderRadius: 2,
	},
})
