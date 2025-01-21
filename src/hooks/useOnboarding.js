import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'onboarding_shown'

export const useOnboarding = () => {
	const [showOnboarding, setShowOnboarding] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		checkOnboardingStatus()
	}, [])

	const checkOnboardingStatus = async () => {
		try {
			const hasSeenOnboarding = await AsyncStorage.getItem(STORAGE_KEY)
			setShowOnboarding(!hasSeenOnboarding)
		} catch (error) {
			console.error('Error checking onboarding status:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDismiss = () => {
		setShowOnboarding(false)
	}

	const handlePostpone = () => {
		setShowOnboarding(false)
	}

	const showOnboardingManually = () => {
		setShowOnboarding(true)
	}

	return {
		loading,
		showOnboarding,
		handleDismiss,
		handlePostpone,
		showOnboardingManually
	}
}
