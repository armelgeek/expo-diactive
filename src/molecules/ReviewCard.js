import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Rating, Button, Input } from 'react-native-elements'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const ReviewCard = ({ 
  review,
  onRespond,
  isPartner = false,
}) => {
  const [response, setResponse] = useState('')
  const [showResponseInput, setShowResponseInput] = useState(false)

  const handleRespond = () => {
    onRespond(review.id, response)
    setResponse('')
    setShowResponseInput(false)
  }

  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {review.user.profiles[0]?.full_name || review.user.profiles[0]?.username}
          </Text>
          <Text style={styles.date}>
            {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })}
          </Text>
        </View>
        <Rating
          readonly
          startingValue={review.rating}
          imageSize={16}
        />
      </View>

      <Text style={styles.comment}>{review.comment}</Text>

      {review.response && (
        <View style={styles.response}>
          <Text style={styles.responseHeader}>Réponse du partenaire :</Text>
          <Text style={styles.responseText}>{review.response.response}</Text>
          <Text style={styles.responseDate}>
            {format(new Date(review.response.created_at), 'dd MMMM yyyy', { locale: fr })}
          </Text>
        </View>
      )}

      {isPartner && !review.response && (
        <View style={styles.responseActions}>
          {!showResponseInput ? (
            <Button
              title="Répondre"
              type="outline"
              onPress={() => setShowResponseInput(true)}
            />
          ) : (
            <View>
              <Input
                placeholder="Votre réponse"
                value={response}
                onChangeText={setResponse}
                multiline
              />
              <View style={styles.responseButtons}>
                <Button
                  title="Annuler"
                  type="outline"
                  onPress={() => setShowResponseInput(false)}
                  containerStyle={styles.responseButton}
                />
                <Button
                  title="Envoyer"
                  onPress={handleRespond}
                  disabled={!response.trim()}
                  containerStyle={styles.responseButton}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  comment: {
    marginBottom: 15,
  },
  response: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  responseHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  responseText: {
    marginBottom: 5,
  },
  responseDate: {
    color: '#666',
    fontSize: 12,
  },
  responseActions: {
    marginTop: 15,
  },
  responseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  responseButton: {
    width: '48%',
  },
}) 