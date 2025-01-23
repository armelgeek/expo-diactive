import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useSteps } from '../../hooks/useSteps'
import { StatsCard } from '../../molecules/StatsCard'
import { useTheme } from '../../context/ThemeContext'
import { useOnboarding } from '../../hooks/useOnboarding'

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    loading,
    steps,
    points,
    pointsBalance,
    dailyGoal,
    isValidated,
    period,
    validateDailySteps,
    changePeriod
  } = useSteps()

  const {
    showOnboarding,
    handleDismiss,
    handlePostpone
  } = useOnboarding()

  const handleValidation = async () => {
    try {
      await validateDailySteps()
    } catch (error) {
      alert(error.message)
    }
  }

  // Calculer les statistiques
  const distance = (steps * 0.0007).toFixed(1) // Environ 0.7m par pas
  const calories = Math.round(steps * 0.05) // Environ 0.05 calories par pas
  const diamonds = Math.floor(steps / 1000) // 1 diamant tous les 1000 pas

  const menuItems = [
    {
      icon: 'trophy',
      label: 'Challenges',
      onPress: () => navigation.navigate('Profile', { screen: 'Challenges' }),
    },
  ]

  const getPeriodGoal = () => {
    switch (period) {
      case 'weekly':
        return dailyGoal * 7
      case 'monthly':
        return dailyGoal * 30
      default:
        return dailyGoal
    }
  }

  const getProgressPercentage = () => {
    return Math.min((steps / getPeriodGoal()) * 100, 100).toFixed(0)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.pointsContainer}>
          <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
            {pointsBalance} points
          </Text>
        </View>

        <View style={styles.periodSelector}>
          <Button
            mode={period === 'daily' ? "contained" : "outlined"}
            style={styles.periodButton}
            onPress={() => changePeriod('daily')}
          >
            {t('period.day')}
          </Button>
          <Button
            mode={period === 'weekly' ? "contained" : "outlined"}
            style={styles.periodButton}
            onPress={() => changePeriod('weekly')}
          >
            {t('period.week')}
          </Button>
          <Button
            mode={period === 'monthly' ? "contained" : "outlined"}
            style={styles.periodButton}
            onPress={() => changePeriod('monthly')}
          >
            {t('period.month')}
          </Button>
        </View>

        {menuItems.map((menu, index) => (
          <TouchableOpacity
            key={index}
            onPress={menu.onPress}
            style={styles.menuItem}
          >
            <Text>{menu.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.mascotContainer}>
          <View style={[styles.mascotCircle, { borderColor: theme.colors.primary }]}>
            <Text variant="displaySmall" style={[styles.progressText, { color: theme.colors.primary }]}>
              {getProgressPercentage()}%
            </Text>
          </View>
          <Text variant="headlineMedium" style={[styles.stepsCount, { color: theme.colors.primary }]}>
            {steps}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.text }}>
            {t('home.stepsLabel')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
            Objectif : {getPeriodGoal()} pas
          </Text>
        </View>

        {period === 'daily' && (
          <>
            <Text style={[styles.instruction, { color: theme.colors.text }]}>
              {t('home.validationInstruction')}
            </Text>

            <Button
              mode="contained"
              onPress={handleValidation}
              disabled={isValidated || steps === 0}
              style={styles.validateButton}
            >
              {isValidated ? t('home.stepsValidated') : t('home.validateSteps')}
            </Button>

            {!isValidated && steps > 0 && (
              <Text variant="bodySmall" style={[styles.warning, { color: theme.colors.error }]}>
                {t('home.warning')}
              </Text>
            )}
          </>
        )}

        <StatsCard
          distance={distance}
          calories={calories}
          diamonds={diamonds}
          validatedSteps={steps}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  periodButton: {
    flex: 1,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mascotContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  mascotCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  stepsCount: {
    marginBottom: 4,
  },
  instruction: {
    textAlign: 'center',
    marginHorizontal: 32,
    marginVertical: 16,
  },
  validateButton: {
    marginHorizontal: 32,
    marginBottom: 16,
  },
  warning: {
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 8,
  },
  pointsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
