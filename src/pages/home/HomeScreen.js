import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useSteps } from '../../hooks/useSteps'
import { StatsCard } from '../../molecules/StatsCard'
import { useTheme } from '../../context/ThemeContext'
import { useOnboarding } from '../../hooks/useOnboarding'
import HexagonButton from '../../atoms/HexagonButton'
import { AppColors } from '../../theme'
import Gauge from '../../atoms/Gauge'
import resources from '../../resources/resources'
import DayAndAverage from '../../molecules/DayAndAverage'
import StepCounter from '../../molecules/StepCounter'
import CallAction from '../../molecules/CallAction'

const HomeScreen = ({ navigation }) => {
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

  const distance = (steps * 0.0007).toFixed(1)
  const calories = Math.round(steps * 0.05)
  const diamonds = Math.floor(steps / 1000)


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
    return Math.min((steps / getPeriodGoal())).toFixed(0)
  }

  const options = {
    displayValue: false,
    filledArcColor: AppColors.primary,
    emptyArcColor: AppColors.primary,
    incompleteArcColor: AppColors.warning,
    valueBoxColor: '#000000',
    valueFontColor: '#FFFFFF',
    centralCircleColor: 'white',
    overlayImageSource: resources.mascot.happy,
    segments: [
      {
        total: dailyGoal,
        filled: getProgressPercentage,
      },
    ],
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>

       <View style={styles.periodSelector}>
        <HexagonButton
            variant="extraSmall"
            text={t('period.day')}
            color={
              period === 'daily' ? AppColors.primary : AppColors.darkColor
            }
            textColor={period === 'daily' ? 'white' : AppColors.lightGray}
            onPress={() => changePeriod('daily')}
          />
          <HexagonButton
            variant="extraSmall"
            text={t('period.week')}
            color={
              period === 'weekly' ? AppColors.primary : AppColors.darkColor
            }
            textColor={period === 'weekly' ? 'white' : AppColors.lightGray}
            onPress={() => changePeriod('weekly')}
          />
          <HexagonButton
            variant="extraSmall"
            text={t('period.month')}
            color={
              period === 'monthly' ? AppColors.primary : AppColors.darkColor
            }
            textColor={period === 'monthly' ? 'white' : AppColors.lightGray}
              onPress={() => changePeriod('monthly')}
          />
        </View>



        <View style={styles.mascotContainer}>
          <Gauge {...options}/>
          <StepCounter/>

        </View>
        <CallAction>
          {period === 'daily' && (
            <>
            <HexagonButton
              variant="small"
              text={isValidated ? t('home.stepsValidated') : t('home.validateSteps')}
              onPress={handleValidation}
              disabled={isValidated || steps === 0}
              style={styles.validateButton}
            />

            {!isValidated && steps > 0 && (
              <Text variant="bodySmall" style={[styles.warning, { color: theme.colors.error }]}>
                {t('home.warning')}
              </Text>
            )}
          </>
        )}
      </CallAction>
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
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    alignItems: 'center'
  },
  mascotCircle: {
    borderRadius: 100,
    borderWidth: 2,
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

export default HomeScreen
