import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Overlay, Text, Input, Button } from 'react-native-elements'

export const SharePointsModal = ({
  isVisible,
  onClose,
  onShare,
  friendName,
  maxPoints,
}) => {
  const [points, setPoints] = useState('')

  const handleShare = () => {
    const pointsNumber = parseInt(points)
    if (pointsNumber > 0 && pointsNumber <= maxPoints) {
      onShare(pointsNumber)
      setPoints('')
      onClose()
    }
  }

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <Text h4 style={styles.title}>
        Partager des points avec {friendName}
      </Text>
      
      <Text style={styles.subtitle}>
        Points disponibles : {maxPoints}
      </Text>

      <Input
        placeholder="Nombre de points"
        keyboardType="numeric"
        value={points}
        onChangeText={setPoints}
        errorMessage={
          points && (parseInt(points) > maxPoints || parseInt(points) <= 0)
            ? 'Montant invalide'
            : ''
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
          title="Partager"
          onPress={handleShare}
          containerStyle={styles.button}
          disabled={!points || parseInt(points) > maxPoints || parseInt(points) <= 0}
        />
      </View>
    </Overlay>
  )
}

const styles = StyleSheet.create({
  overlay: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
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