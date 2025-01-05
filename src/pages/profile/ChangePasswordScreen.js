import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text, Surface } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChangePassword = async () => {
    try {
      setLoading(true)
      setError(null)

      if (newPassword !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      if (newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Retourner au profil après 2 secondes
      setTimeout(() => {
        navigation.goBack()
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
          Modifier le mot de passe
        </Text>

        <TextInput
          label="Mot de passe actuel"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          mode="outlined"
          secureTextEntry
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
          label="Confirmer le nouveau mot de passe"
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
          onPress={handleChangePassword}
          loading={loading}
          disabled={!currentPassword || !newPassword || !confirmPassword || loading}
          style={styles.button}
        >
          Modifier le mot de passe
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.button}
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
    marginBottom: 24,
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
  },
  success: {
    color: '#4CAF50',
    marginBottom: 16,
  },
}) 