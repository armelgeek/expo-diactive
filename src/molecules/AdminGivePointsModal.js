import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Input, Button } from 'react-native-elements'
import { supabase } from '../services/supabase'
import { CustomOverlay } from './CustomOverlay'

export const AdminGivePointsModal = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('')
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGivePoints = async () => {
    try {
      setLoading(true)

      // Trouver l'utilisateur par email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (userError) throw new Error('Utilisateur non trouvé')

      // Donner les points
      const { error: giveError } = await supabase
        .rpc('admin_give_points', {
          target_user_id: userData.id,
          points_amount: parseInt(points),
          reason: reason || 'Points administratifs'
        })

      if (giveError) throw giveError

      alert('Points attribués avec succès !')
      onSuccess?.()
      handleClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPoints('')
    setReason('')
    onClose()
  }

  const isValid = email && points && !isNaN(parseInt(points)) && parseInt(points) > 0

  return (
    <CustomOverlay
      isVisible={isVisible}
      onBackdropPress={handleClose}
    >
      <View style={styles.container}>
        <Text h4 style={styles.title}>Donner des points</Text>
        
        <Input
          placeholder="Email de l'utilisateur"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          placeholder="Nombre de points"
          value={points}
          onChangeText={setPoints}
          keyboardType="numeric"
        />

        <Input
          placeholder="Raison (optionnel)"
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <View style={styles.buttons}>
          <Button
            title="Annuler"
            type="outline"
            onPress={handleClose}
            containerStyle={styles.button}
          />
          <Button
            title="Donner"
            onPress={handleGivePoints}
            disabled={!isValid || loading}
            loading={loading}
            containerStyle={styles.button}
          />
        </View>
      </View>
    </CustomOverlay>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    textAlign: 'center',
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