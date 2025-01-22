import React from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Button, Card, Text, ProgressBar } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useSteps } from '../../hooks/useSteps'
import { useOnboarding } from '../../hooks/useOnboarding'
import { OnboardingModal } from '../../molecules/OnboardingModal'

export default function HomeScreen() {
  const { t } = useTranslation()
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

  const progress = steps / dailyGoal
  const formattedProgress = Math.min(progress, 1)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {t('home.todaySteps')}
            </Text>

            <View style={styles.statsContainer}>
              <Text variant="headlineMedium">{steps.toLocaleString()}</Text>
              <Text variant="bodyMedium">
                / {t('home.steps', { count: dailyGoal.toLocaleString() })}
              </Text>
            </View>

            <ProgressBar
              progress={formattedProgress}
              style={styles.progressBar}
            />

            <View style={styles.pointsContainer}>
              <Text variant="bodyLarge">
                {t('common.points', { count: points })}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleValidation}
              disabled={isValidated || steps === 0}
              style={styles.validateButton}
            >
              {isValidated ? t('home.stepsValidated') : t('home.validateSteps')}
            </Button>

            {!isValidated && steps > 0 && (
              <Text variant="bodySmall" style={styles.warning}>
                {t('home.warning')}
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <OnboardingModal
        visible={showOnboarding}
        onDismiss={handleDismiss}
        onPostpone={handlePostpone}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 8,
  },
  pointsContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  validateButton: {
    marginTop: 16,
  },
  warning: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 8,
  },
})
