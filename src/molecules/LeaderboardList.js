import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, SegmentedButtons, List, Avatar, Surface } from 'react-native-paper'
import { useGamification } from '../hooks/useGamification'
import { useTheme } from '../context/ThemeContext'

export const LeaderboardList = () => {
	const { leaderboard, userRank, loading, fetchLeaderboardByPeriod } = useGamification()
	const { theme } = useTheme()
	const [period, setPeriod] = useState('daily')

	const handlePeriodChange = (newPeriod) => {
		setPeriod(newPeriod)
		fetchLeaderboardByPeriod(newPeriod)
	}

	const renderRankIcon = (rank) => {
		switch (rank) {
			case 1:
				return '🥇'
			case 2:
				return '🥈'
			case 3:
				return '🥉'
			default:
				return rank
		}
	}

	const renderUserRank = () => {
		if (!userRank) return null

		return (
			<Surface
				style={[
					styles.userRankContainer,
					{ backgroundColor: theme.colors.primaryContainer }
				]}
			>
				<Text variant="titleMedium" style={{ color: theme.colors.text }}>
					Votre classement : {renderRankIcon(userRank.rank)}
				</Text>
				<View style={styles.userStats}>
					<Text variant="bodyMedium" style={{ color: theme.colors.text }}>
						{userRank.steps_count} pas
					</Text>
					<Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
						{userRank.points_earned} points
					</Text>
				</View>
			</Surface>
		)
	}

	const renderLeaderboardItem = (item, index) => (
		<List.Item
			key={item.id}
			title={item.user.username}
			description={`${item.steps_count} pas • ${item.points_earned} points`}
			left={() => (
				<View style={styles.rankContainer}>
					<Text variant="titleMedium" style={{ color: theme.colors.text }}>
						{renderRankIcon(index + 1)}
					</Text>
				</View>
			)}
			right={() => (
				<Avatar.Text
					size={40}
					label={item.user.username.substring(0, 2).toUpperCase()}
					backgroundColor={theme.colors.primary}
				/>
			)}
		/>
	)

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Chargement du classement...</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<SegmentedButtons
				value={period}
				onValueChange={handlePeriodChange}
				buttons={[
					{ value: 'daily', label: 'Jour' },
					{ value: 'weekly', label: 'Semaine' },
					{ value: 'monthly', label: 'Mois' }
				]}
				style={styles.periodSelector}
			/>

			{renderUserRank()}

			<ScrollView>
				{leaderboard.map((item, index) => renderLeaderboardItem(item, index))}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	periodSelector: {
		marginBottom: 16,
	},
	userRankContainer: {
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
	},
	userStats: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	rankContainer: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
})
