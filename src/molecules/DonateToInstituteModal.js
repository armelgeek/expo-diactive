import React, { useState } from 'react'
import { View,Modal, StyleSheet } from 'react-native'
import { Text, Button, Input } from 'react-native-elements'
import { useSteps } from '../hooks/useSteps'
import { user as userService } from '../services/api/user'
import { CustomOverlay } from './CustomOverlay'
import { donationService } from '../services/api/donation'

const DonateToInstituteModal = ({
  isVisible,
  onClose,
  institute,
  maxPoints,
}) => {
  console.log('institute', institute)
  const [points, setPoints] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshData } = useSteps()

  const handleDonate = async () => {

    if (isNaN(pointsValue) || pointsValue <= 0) {
      throw new Error('Montant invalide')
    }
    if (pointsValue > maxPoints) {
      throw new Error('Points insuffisants')
    }

    setLoading(true)

    const user = await userService.getUser();
    console.log('icii',user);
    try {
      const pointsValue = parseInt(points)
      if (isNaN(pointsValue) || pointsValue <= 0) {
        throw new Error('Montant invalide')
      }
      if (pointsValue > maxPoints) {
        throw new Error('Points insuffisants')
      }

      setLoading(true)
      const result = await donationService.makeDonation(institute.id, user.id, pointsValue)
      if (result.goalReached) {
        // Handle goal reached logic
      }
      await refreshData()
      onClose()
      setPoints('');
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const pointsValue = parseInt(points)
  const isValid = !isNaN(pointsValue) && pointsValue > 0 && pointsValue <= maxPoints

  return (
    <CustomOverlay visible={isVisible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text h4 style={styles.title}>Faire un don à {institute?.name}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text>Objectif : {institute?.points_goal?.toLocaleString()} points</Text>
            <Text>Actuel : {institute?.current_points?.toLocaleString()} points</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min((institute?.current_points / institute?.points_goal) * 100, 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.remainingPoints}>
            Reste à atteindre : {(institute?.points_goal - institute?.current_points)?.toLocaleString()} points
          </Text>
        </View>

        <Text style={styles.pointsAvailable}>
          Points disponibles : {maxPoints?.toLocaleString()}
        </Text>

        <Input
          placeholder="Nombre de points à donner"
          keyboardType="numeric"
          value={points}
          onChangeText={setPoints}
          errorMessage={
            points && !isValid
              ? "Le nombre de points doit être positif et ne pas dépasser vos points disponibles"
              : ""
          }
        />

        <View style={styles.buttons}>
          <Button
            title="Annuler"
            type="outline"
            onPress={onClose}
            containerStyle={styles.button}
          />
          <Button
            title="Faire le don"
            onPress={handleDonate}
            disabled={!isValid || loading}
            loading={loading}
            containerStyle={styles.button}
          />
        </View>
      </View>
    </CustomOverlay>
  )
}
export default DonateToInstituteModal;
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2089dc',
  },
  remainingPoints: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  pointsAvailable: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2089dc',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    width: '45%',
  },
})
