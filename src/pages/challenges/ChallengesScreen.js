import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { SegmentedButtons } from 'react-native-paper'
import { MyChallengesList } from '../../molecules/MyChallengesList'
import { ChallengesList } from '../../molecules/ChallengesList'
import { useTheme } from '../../context/ThemeContext'

export const ChallengesScreen = () => {
	const [activeTab, setActiveTab] = useState('my-challenges')
	const { theme } = useTheme()

	return (
		<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
			<SegmentedButtons
				value={activeTab}
				onValueChange={setActiveTab}
				buttons={[
					{ value: 'my-challenges', label: 'Mes Challenges' },
					{ value: 'available', label: 'Disponibles' }
				]}
				style={styles.tabs}
			/>

			{activeTab === 'my-challenges' ? (
				<MyChallengesList />
			) : (
				<ChallengesList />
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	tabs: {
		margin: 16,
	},
});
