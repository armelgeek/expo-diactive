import React from 'react'
import { View, StyleSheet } from 'react-native'
import { List, RadioButton, Text, Divider } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'

export const LanguageSelector = () => {
	const { t } = useTranslation()
	const { languages, currentLanguage, changeLanguage } = useLanguage()

	return (
		<View style={styles.container}>
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
	}
})
