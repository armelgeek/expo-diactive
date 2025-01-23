import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, ProgressBar, useTheme, IconButton } from 'react-native-paper'
import { useGamification } from '../hooks/useGamification'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const MyChallengesList = () => {
	const { challenges, userChallenges, loading } = useGamification()
	const theme = useTheme()

	const getProgressPercentage = (progress, goalValue) => {
		return Math.min(progress / goalValue, 1)
	}

	const getTimeLeft = (endDate) => {
		const end = new Date(endDate)
		const now = new Date()
		const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
		return days > 1 ? `${days} jours restants` : 'Dernier jour !'
	}

	const renderChallenge = (challenge, userChallenge) => {
		const progress = userChallenge?.progress || 0
		const isCompleted = userChallenge?.completed_at != null
		const progressPercentage = getProgressPercentage(progress, challenge.goal_value)

		return (
			<Card
				key={challenge.id}
				style={[styles.challengeCard, { backgroundColor: theme.colors.surface }]}
			>
				<Card.Content>
					<View style={styles.headerRow}>
						<View style={styles.titleContainer}>
							<Text variant="titleMedium" style={{ color: theme.colors.primary }}>
								{challenge.title}
							</Text>
							<Text variant="bodySmall" style={styles.timeLeft}>
								{getTimeLeft(challenge.end_date)}
							</Text>
						</View>
						{isCompleted && (
							<IconButton
								icon="check-circle"
								iconColor={theme.colors.primary}
								size={24}
							/>
						)}
					</View>

					<Text variant="bodyMedium" style={styles.description}>
						{challenge.description}
					</Text>

					<View style={styles.progressContainer}>
						<ProgressBar
							progress={progressPercentage}
							color={isCompleted ? theme.colors.primary : theme.colors.secondary}
							style={styles.progressBar}
						/>
						<Text variant="bodySmall" style={styles.progressText}>
							{progress} / {challenge.goal_value} pas
						</Text>
					</View>

					<View style={styles.footer}>
						<Text variant="bodySmall" style={styles.reward}>
							Récompense : {challenge.reward_points} points
						</Text>
						{isCompleted && (
							<Text variant="bodySmall" style={styles.completedText}>
								Terminé le {format(new Date(userChallenge.completed_at), 'dd MMMM', { locale: fr })}
							</Text>
						)}
					</View>
				</Card.Content>
			</Card>
		)
	}

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Chargement des challenges...</Text>
			</View>
		)
	}

	const activeUserChallenges = userChallenges.filter(uc => !uc.completed_at)
	const completedUserChallenges = userChallenges.filter(uc => uc.completed_at)

	return (
		<ScrollView style={styles.container}>
			{activeUserChallenges.length > 0 && (
				<>
					<Text variant="titleLarge" style={styles.section}>
						Challenges en cours ({activeUserChallenges.length})
					</Text>
					{activeUserChallenges.map(uc => {
						const challenge = challenges.find(c => c.id === uc.challenge_id)
						return challenge && renderChallenge(challenge, uc)
					})}
				</>
			)}

			{completedUserChallenges.length > 0 && (
				<>
					<Text variant="titleLarge" style={[styles.section, styles.completedSection]}>
						Challenges terminés ({completedUserChallenges.length})
					</Text>
					{completedUserChallenges.map(uc => {
						const challenge = challenges.find(c => c.id === uc.challenge_id)
						return challenge && renderChallenge(challenge, uc)
					})}
				</>
			)}

			{userChallenges.length === 0 && (
				<View style={styles.emptyContainer}>
					<Text variant="bodyLarge" style={styles.emptyText}>
						Vous n'avez pas encore rejoint de challenge.
					</Text>
					<Text variant="bodyMedium" style={styles.emptySubtext}>
						Consultez la liste des challenges disponibles pour commencer !
					</Text>
				</View>
			)}
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
	completedSection: {
		marginTop: 24,
	},
	challengeCard: {
		marginBottom: 12,
		elevation: 2,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	titleContainer: {
		flex: 1,
	},
	timeLeft: {
		marginTop: 4,
		color: '#666',
	},
	description: {
		marginBottom: 12,
	},
	progressContainer: {
		marginBottom: 8,
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
		marginBottom: 4,
	},
	progressText: {
		textAlign: 'right',
		color: '#666',
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 8,
	},
	reward: {
		color: '#666',
	},
	completedText: {
		color: '#666',
		fontStyle: 'italic',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 32,
	},
	emptyText: {
		textAlign: 'center',
		marginBottom: 8,
	},
	emptySubtext: {
		textAlign: 'center',
		color: '#666',
	},
});
