import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Modal, Portal, Text, Button, IconButton } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'onboarding_shown'

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

	const handleNext = () => {
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1)
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

					<ScrollView
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						scrollEnabled={false}
						contentContainerStyle={styles.slidesContainer}
					>
						{slides.map((slide, index) => (
							<View
								key={index}
								style={[
									styles.slide,
									{ transform: [{ translateX: (index - currentSlide) * Dimensions.get('window').width }] }
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
					</ScrollView>

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
		borderRadius: 8,
		padding: 20,
		maxHeight: '80%',
	},
	container: {
		flex: 1,
	},
	closeButton: {
		position: 'absolute',
		right: 0,
		top: 0,
		zIndex: 1,
	},
	slidesContainer: {
		flexGrow: 1,
	},
	slide: {
		width: Dimensions.get('window').width - 80,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
	},
	slideIcon: {
		marginBottom: 20,
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
		justifyContent: 'space-between',
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
