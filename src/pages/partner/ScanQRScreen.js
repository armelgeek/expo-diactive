import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { supabase } from '../../services/supabase'

export const ScanQRScreen = ({ route, navigation }) => {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  const handleBarCodeScanned = async ({ data }) => {
    try {
      setScanned(true)
      const qrData = JSON.parse(data)
      
      // Mettre à jour le statut de la commande
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', qrData.orderId)

      if (error) throw error

      alert('Commande validée avec succès!')
      navigation.goBack()
    } catch (err) {
      console.error('Error processing QR code:', err)
      setError(err.message)
      setScanned(false)
    }
  }

  if (hasPermission === null) {
    return <Text>Demande d'autorisation de la caméra...</Text>
  }
  if (hasPermission === false) {
    return <Text>Pas d'accès à la caméra</Text>
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button 
          mode="contained" 
          onPress={() => setScanned(false)}
          style={styles.button}
        >
          Scanner à nouveau
        </Button>
      )}
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  button: {
    margin: 16,
  },
  error: {
    color: '#B00020',
    margin: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
}) 