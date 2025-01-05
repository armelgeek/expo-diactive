import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import QRCode from 'react-native-qrcode-svg'

export const QRCodeScreen = ({ route }) => {
  const { orderId, orderData } = route.params

  // Créer un objet avec les informations nécessaires
  const qrData = JSON.stringify({
    orderId,
    timestamp: new Date().toISOString(),
    // Ajouter d'autres informations si nécessaire
  })

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Commande #{orderId}
      </Text>
      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={250}
        />
      </View>
      <Text style={styles.instructions}>
        Présentez ce code QR au partenaire pour récupérer votre commande
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  instructions: {
    textAlign: 'center',
    color: '#666',
  },
}) 