import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, ProgressBar, Chip } from 'react-native-paper'
import { useGamification } from '../hooks/useGamification'
import { useTheme } from '../context/ThemeContext'

export const ChallengesList = () => {
	const { challenges, userChallenges, loading, joinChallenge } = useGamification()
	const { theme } = useTheme()

	const getChallengeProgress = (challenge) => {
		const userChallenge = userChallenges.find(uc => uc.challenge_id === challenge.id)
		if (!userChallenge) return 0
		return Math.min(userChallenge.current_value / challenge.goal_value, 1)
	}

	const isJoined = (challengeId) => {
		return userChallenges.some(uc => uc.challenge_id === challengeId)
	}

	const getTimeLeft = (endDate) => {
		const end = new Date(endDate)
		const now = new Date()
		const diff = end - now

		const days = Math.floor(diff / (1000 * 60 * 60 * 24))
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

		if (days > 0) return `${days}j restants`
		if (hours > 0) return `${hours}h restantes`
		return 'Termine bientôt'
	}

	const renderChallenge = (challenge) => {
		const progress = getChallengeProgress(challenge)
		const joined = isJoined(challenge.id)

		return (
			<Card
				key={challenge.id}
				style={[
					styles.challengeCard,
					{ backgroundColor: theme.colors.surface }
				]}
			>
				<Card.Content>
					<View style={styles.header}>
						<View style={styles.titleContainer}>
							<Text variant="titleMedium" style={{ color: theme.colors.text }}>
								{challenge.title}
							</Text>
							<Chip
								style={[
									styles.typeChip,
									{ backgroundColor: theme.colors.primaryContainer }
								]}
							>
								{challenge.type}
							</Chip>
						</View>
						<Text variant="bodySmall" style={{ color: theme.colors.primary }}>
							{getTimeLeft(challenge.end_date)}
						</Text>
					</View>

					<Text variant="bodyMedium" style={[styles.description, { color: theme.colors.text }]}>
						{challenge.description}
					</Text>

					<View style={styles.progressContainer}>
						<Text variant="bodySmall" style={{ color: theme.colors.text }}>
							Objectif : {challenge.goal_value} {challenge.goal_type}
						</Text>
						<ProgressBar
							progress={progress}
							color={theme.colors.primary}
							style={styles.progressBar}
						/>
					</View>

					<View style={styles.footer}>
						<Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
							Récompense : {challenge.reward_points} points
						</Text>
						{!joined && (
							<Button
								mode="contained"
								onPress={() => joinChallenge(challenge.id)}
							>
								Participer
							</Button>
						)}
					</View>
				</Card.Content>
			</Card>
		)
	}

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Chargement des défis...</Text>
			</View>
		)
	}

	return (
		<ScrollView style={styles.container}>
			<Text variant="titleLarge" style={[styles.section, { color: theme.colors.text }]}>
				Défis actifs ({challenges.length})
			</Text>
			{challenges.map(renderChallenge)}
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
	challengeCard: {
		marginBottom: 12,
		elevation: 2,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	titleContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	typeChip: {
		height: 24,
	},
	description: {
		marginBottom: 16,
	},
	progressContainer: {
		marginBottom: 16,
	},
	progressBar: {
		marginTop: 4,
		height: 4,
		borderRadius: 2,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
})
