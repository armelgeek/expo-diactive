import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native'
import { Modal, Portal, Text, Button, IconButton, ProgressBar } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'onboarding_shown'
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const SLIDE_DURATION = 10000

const slides = [
	{
		title: 'Bienvenue sur Diactive',
		description: 'Transformez vos pas quotidiens en points et faites la différence !',
		icon: 'walk'
	},
	{
		title: 'Validation Quotidienne',
		description: 'N\'oubliez pas de valider vos pas chaque jour avant minuit pour ne pas les perdre.',
		icon: 'check-circle'
	},
	{
		title: 'Échangez vos Points',
		description: 'Utilisez vos points pour obtenir des récompenses ou faire des dons à des associations.',
		icon: 'gift'
	}
]

export const OnboardingModal = ({ visible, onDismiss, onPostpone }) => {
	const [currentSlide, setCurrentSlide] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const progressAnimation = useRef(new Animated.Value(0)).current
	const slideTimer = useRef(null)

	const startSlideTimer = () => {
		progressAnimation.setValue(0)

		Animated.timing(progressAnimation, {
			toValue: 1,
			duration: SLIDE_DURATION,
			useNativeDriver: false
		}).start(({ finished }) => {
			if (finished && !isPaused) {
				handleNext()
			}
		})
	}

	const handleNext = () => {
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1)
		} else {
			handleFinish()
		}
	}

	const handlePrevious = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1)
		}
	}

	const handleFinish = async () => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, 'true')
			onDismiss()
		} catch (error) {
			console.error('Error saving onboarding status:', error)
		}
	}

	const handlePostpone = async () => {
		try {
			await AsyncStorage.removeItem(STORAGE_KEY)
			onPostpone()
		} catch (error) {
			console.error('Error postponing onboarding:', error)
		}
	}

	const pauseTimer = () => {
		setIsPaused(true)
		progressAnimation.stopAnimation()
	}

	const resumeTimer = () => {
		setIsPaused(false)
		startSlideTimer()
	}

	useEffect(() => {
		if (visible) {
			startSlideTimer()
		}
		return () => {
			progressAnimation.stopAnimation()
		}
	}, [visible, currentSlide])

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={styles.modal}
			>
				<View style={styles.container}>
					<IconButton
						icon="close"
						size={24}
						style={styles.closeButton}
						onPress={onDismiss}
					/>

					<Animated.View
						style={[
							styles.progressBar,
							{
								width: progressAnimation.interpolate({
									inputRange: [0, 1],
									outputRange: ['0%', '100%']
								})
							}
						]}
					/>

					<View
						style={styles.content}
						onTouchStart={pauseTimer}
						onTouchEnd={resumeTimer}
					>
						{slides.map((slide, index) => (
							<View
								key={index}
								style={[
									styles.slide,
									{
										opacity: currentSlide === index ? 1 : 0,
										transform: [{ scale: currentSlide === index ? 1 : 0.8 }]
									}
								]}
							>
								<IconButton
									icon={slide.icon}
									size={80}
									style={styles.slideIcon}
								/>
								<Text variant="headlineMedium" style={styles.title}>
									{slide.title}
								</Text>
								<Text variant="bodyLarge" style={styles.description}>
									{slide.description}
								</Text>
							</View>
						))}
					</View>

					<View style={styles.pagination}>
						{slides.map((_, index) => (
							<View
								key={index}
								style={[
									styles.paginationDot,
									currentSlide === index && styles.paginationDotActive
								]}
							/>
						))}
					</View>

					<View style={styles.buttonsContainer}>
						{currentSlide > 0 && (
							<Button
								mode="outlined"
								onPress={handlePrevious}
								style={styles.button}
							>
								Précédent
							</Button>
						)}

						{currentSlide < slides.length - 1 ? (
							<Button
								mode="contained"
								onPress={handleNext}
								style={styles.button}
							>
								Suivant
							</Button>
						) : (
							<View style={styles.finalButtons}>
								<Button
									mode="outlined"
									onPress={handlePostpone}
									style={styles.button}
								>
									Plus tard
								</Button>
								<Button
									mode="contained"
									onPress={handleFinish}
									style={styles.button}
								>
									Compris !
								</Button>
							</View>
						)}
					</View>
				</View>
			</Modal>
		</Portal>
	)
}

const styles = StyleSheet.create({
	modal: {
		backgroundColor: 'white',
		margin: 20,
		borderRadius: 16,
		padding: 20,
		height: SCREEN_HEIGHT * 0.7,
		justifyContent: 'center',
	},
	container: {
		flex: 1,
		position: 'relative',
	},
	closeButton: {
		position: 'absolute',
		right: -10,
		top: -10,
		zIndex: 1,
	},
	progressBar: {
		height: 3,
		backgroundColor: '#2196F3',
		position: 'absolute',
		top: 0,
		left: 0,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	slide: {
		position: 'absolute',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	slideIcon: {
		marginBottom: 20,
		backgroundColor: '#f0f0f0',
		borderRadius: 40,
	},
	title: {
		textAlign: 'center',
		marginBottom: 16,
		fontWeight: 'bold',
	},
	description: {
		textAlign: 'center',
		marginBottom: 24,
		color: '#666',
		paddingHorizontal: 20,
	},
	pagination: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 20,
	},
	paginationDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#ddd',
		marginHorizontal: 4,
	},
	paginationDotActive: {
		backgroundColor: '#2196F3',
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	button: {
		minWidth: 120,
	},
	finalButtons: {
		flexDirection: 'row',
		gap: 10,
	},
})
