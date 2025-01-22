import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { HeaderButtons } from './HeaderButtons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const Header = ({ title }) => {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: colors.surface,
					paddingTop: insets.top,
					borderBottomColor: colors.border
				}
			]}
		>
			<View style={styles.content}>
				<Text variant="titleLarge" style={styles.title}>{title}</Text>
				<HeaderButtons />
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		borderBottomWidth: 1,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	content: {
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
	},
	title: {
		fontWeight: 'bold',
	},
})
