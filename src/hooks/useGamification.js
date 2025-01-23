import { useState, useEffect, useCallback } from 'react'
import { gamificationService } from '../services/gamificationService'
import { user as userService } from '../services/api/user'

export const useGamification = () => {
	const [badges, setBadges] = useState([])
	const [availableBadges, setAvailableBadges] = useState([])
	const [challenges, setChallenges] = useState([])
	const [userChallenges, setUserChallenges] = useState([])
	const [leaderboard, setLeaderboard] = useState([])
	const [userRank, setUserRank] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const fetchUserData = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const user = await userService.getUser()

			const [
				userBadges,
				badges,
				activeChallenges,
				userChallengesData,
				leaderboardData,
				rankData
			] = await Promise.all([
				gamificationService.fetchUserBadges(user.id),
				gamificationService.fetchAvailableBadges(),
				gamificationService.fetchActiveChallenges(),
				gamificationService.fetchUserChallenges(user.id),
				gamificationService.fetchLeaderboard(),
				gamificationService.fetchUserRank(user.id)
			])

			setBadges(userBadges)
			setAvailableBadges(badges)
			setChallenges(activeChallenges)
			setUserChallenges(userChallengesData)
			setLeaderboard(leaderboardData)
			setUserRank(rankData)
		} catch (err) {
			console.error('Error fetching gamification data:', err)
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}, [])

	const joinChallenge = useCallback(async (challengeId) => {
		try {
			setLoading(true)
			const user = await userService.getUser()
			await gamificationService.joinChallenge(user.id, challengeId)
			await fetchUserData() // Refresh data after joining
		} catch (err) {
			console.error('Error joining challenge:', err)
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}, [fetchUserData])

	const fetchLeaderboardByPeriod = useCallback(async (periodType, date) => {
		try {
			setLoading(true)
			const user = await userService.getUser()
			const [leaderboardData, rankData] = await Promise.all([
				gamificationService.fetchLeaderboard(periodType, date),
				gamificationService.fetchUserRank(user.id, periodType, date)
			])
			setLeaderboard(leaderboardData)
			setUserRank(rankData)
		} catch (err) {
			console.error('Error fetching leaderboard:', err)
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchUserData()
	}, [fetchUserData])

	return {
		badges,
		availableBadges,
		challenges,
		userChallenges,
		leaderboard,
		userRank,
		loading,
		error,
		joinChallenge,
		fetchLeaderboardByPeriod,
		refresh: fetchUserData
	}
}
