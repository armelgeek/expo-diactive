import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

export const StatsCard = ({ distance, calories, diamonds, validatedSteps }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statItem}>
        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
          {distance} km
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.text }}>
          {t('stats.distance')}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.statItem}>
        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
          {calories} kcal
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.text }}>
          {t('stats.calories')}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.statItem}>
        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
          {diamonds}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.text }}>
          {t('stats.diamonds')}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.statItem}>
        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
          {validatedSteps}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.text }}>
          {t('stats.validatedSteps')}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
})
