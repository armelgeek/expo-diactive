import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useSteps } from '../../hooks/useSteps'
import { StatsCard } from '../../molecules/StatsCard'
import { useTheme } from '../../context/ThemeContext'
import { useOnboarding } from '../../hooks/useOnboarding'
export default function HomeScreen() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    loading,
    steps,
    points,
    dailyGoal,
    isValidated,
    validateDailySteps,
    refreshData
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <ScrollView style={styles.content}>
        <View style={styles.periodSelector}>
          <Button mode="contained" style={styles.periodButton}>
            {t('period.day')}
          </Button>
          <Button mode="outlined" style={styles.periodButton}>
            {t('period.week')}
          </Button>
          <Button mode="outlined" style={styles.periodButton}>
            {t('period.month')}
          </Button>
        </View>

        <View style={styles.mascotContainer}>
          <View style={[styles.mascotCircle, { borderColor: theme.colors.primary }]}>
            {/* Ici, vous pouvez ajouter l'image de la mascotte */}
          </View>
          <Text variant="headlineMedium" style={[styles.stepsCount, { color: theme.colors.primary }]}>
            {steps}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.text }}>
            {t('home.stepsLabel')}
          </Text>
        </View>

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

        <StatsCard
          distance={distance}
          calories={calories}
          diamonds={diamonds}
          validatedSteps={steps}
        />

        {!isValidated && steps > 0 && (
          <Text variant="bodySmall" style={[styles.warning, { color: theme.colors.error }]}>
            {t('home.warning')}
          </Text>
        )}
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
})
