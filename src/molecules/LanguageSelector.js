import React from 'react'
import { View, StyleSheet } from 'react-native'
import { List, RadioButton, Text, Divider, IconButton } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'

export const LanguageSelector = ({ onClose }) => {
	const { t } = useTranslation()
	const { languages, currentLanguage, changeLanguage } = useLanguage()

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text variant="titleMedium">{t('settings.language.title')}</Text>
				<IconButton
					icon="close"
					size={24}
					onPress={onClose}
				/>
			</View>
			<Divider />
			<List.Section>
				<List.Subheader>{t('settings.language.select')}</List.Subheader>
				{languages.map((lang, index) => (
					<React.Fragment key={lang.code}>
						<List.Item
							title={lang.name}
							onPress={() => changeLanguage(lang.code)}
							right={() => (
								<RadioButton
									value={lang.code}
									status={currentLanguage === lang.code ? 'checked' : 'unchecked'}
									onPress={() => changeLanguage(lang.code)}
								/>
							)}
						/>
						{index < languages.length - 1 && <Divider />}
					</React.Fragment>
				))}
			</List.Section>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 8,
		height: 56,
	}
})
