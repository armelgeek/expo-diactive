import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

export const StatsCard = ({ distance, calories, diamonds, validatedSteps }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  return (
    <View style={[styles.container]}>
      <TouchableOpacity style={styles.menuItem}>
        <Text style={[styles.statText]}>
          {distance} km
        </Text>
        <Text style={styles.menuText}>{t('stats.distance')}</Text>
      </TouchableOpacity>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.menuItem}>
        <Text style={[styles.statText]}>
          {calories} kcal
        </Text>
        <Text style={styles.menuText}>{t('stats.calories')}</Text>
      </TouchableOpacity>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.menuItem}>
        <Text style={[styles.statText]}>
          {diamonds}
        </Text>
        <Text style={styles.menuText}>{t('stats.diamonds')}</Text>
      </TouchableOpacity>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.menuItem}>
        <Text style={[styles.statText]}>
          {validatedSteps}
        </Text>
        <Text style={styles.menuText}>{t('stats.validatedSteps')}</Text>
      </TouchableOpacity>
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
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
  },
  statText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  menuText: {
    fontSize: 10,
    color: '#666',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
})
