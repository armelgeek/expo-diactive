import React from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Button, Card, Text, ProgressBar, IconButton, Menu } from 'react-native-paper'
import { useSteps } from '../../hooks/useSteps'
import { useOnboarding } from '../../hooks/useOnboarding'
import { OnboardingModal } from '../../molecules/OnboardingModal'

export default function HomeScreen() {
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
    handlePostpone,
    showOnboardingManually
  } = useOnboarding()

  const [menuVisible, setMenuVisible] = React.useState(false)

  const handleValidation = async () => {
    try {
      await validateDailySteps()
    } catch (error) {
      // L'erreur est déjà loguée dans le hook
      alert(error.message)
    }
  }

  const progress = steps / dailyGoal
  const formattedProgress = Math.min(progress, 1)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Accueil</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false)
              showOnboardingManually()
            }}
            title="Voir le tutoriel"
            leadingIcon="help-circle"
          />
        </Menu>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>Vos pas aujourd'hui</Text>

            <View style={styles.statsContainer}>
              <Text variant="headlineMedium">{steps.toLocaleString()}</Text>
              <Text variant="bodyMedium">/ {dailyGoal.toLocaleString()} pas</Text>
            </View>

            <ProgressBar
              progress={formattedProgress}
              style={styles.progressBar}
            />

            <View style={styles.pointsContainer}>
              <Text variant="bodyLarge">Points disponibles : {points}</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleValidation}
              disabled={isValidated || steps === 0}
              style={styles.validateButton}
            >
              {isValidated ? 'Pas validés ✓' : 'Valider mes pas'}
            </Button>

            {!isValidated && steps > 0 && (
              <Text variant="bodySmall" style={styles.warning}>
                N'oubliez pas de valider vos pas avant minuit pour ne pas les perdre !
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
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
