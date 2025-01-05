import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text, Surface } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const VerifyOTPScreen = ({ route, navigation }) => {
  const { email, otp } = route.params
  const [enteredOtp, setEnteredOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleVerifyOTP = async () => {
    try {
      setLoading(true)
      setError(null)

      if (enteredOtp !== otp) {
        throw new Error('Le code OTP est incorrect')
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      // Mettre à jour le mot de passe
      //TODO:  ca retourne Auth session missing!
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      setSuccess(true)

      // Retourner à la connexion après 2 secondes
      setTimeout(() => {
        navigation.navigate('Login')
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Vérification du code
        </Text>

        <TextInput
          label="Code de vérification"
          value={enteredOtp}
          onChangeText={setEnteredOtp}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
        />

        <TextInput
          label="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        {error && (
          <Text style={styles.error} variant="bodyMedium">
            {error}
          </Text>
        )}

        {success && (
          <Text style={styles.success} variant="bodyMedium">
            Mot de passe modifié avec succès !
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleVerifyOTP}
          loading={loading}
          disabled={!enteredOtp || !newPassword || !confirmPassword || loading}
          style={styles.button}
        >
          Valider
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={loading}
        >
          Annuler
        </Button>
      </Surface>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  surface: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  success: {
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
}) 