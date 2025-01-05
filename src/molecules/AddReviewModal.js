import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Overlay, Text, Input, Button, Rating } from 'react-native-elements'

export const AddReviewModal = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    onSubmit(rating, comment)
    setRating(5)
    setComment('')
    onClose()
  }

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <Text h4 style={styles.title}>Donner votre avis</Text>
      
      <Rating
        startingValue={rating}
        onFinishRating={setRating}
        style={styles.rating}
      />

      <Input
        placeholder="Votre commentaire"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />

      <View style={styles.buttons}>
        <Button
          title="Annuler"
          type="outline"
          onPress={onClose}
          containerStyle={styles.button}
        />
        <Button
          title="Envoyer"
          onPress={handleSubmit}
          containerStyle={styles.button}
          disabled={!comment.trim()}
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
    marginBottom: 20,
  },
  rating: {
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    width: '48%',
  },
}) 