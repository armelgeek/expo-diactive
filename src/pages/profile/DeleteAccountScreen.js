import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text, Surface, Dialog, Portal } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const DeleteAccountScreen = ({ navigation }) => {
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      setError(null)

      // Vérifier le texte de confirmation
      if (confirmText !== 'SUPPRIMER') {
        throw new Error('Veuillez écrire SUPPRIMER pour confirmer')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Supprimer les données de l'utilisateur
      const { error: profileError } = await supabase
        .from('profile')
        .delete()
        .eq('user_id', user.id)

      if (profileError) throw profileError

      // Supprimer le compte
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id
      )

      if (deleteError) throw deleteError

      // Déconnexion
      await supabase.auth.signOut()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Supprimer le compte
        </Text>

        <Text style={styles.warning} variant="bodyMedium">
          Attention ! Cette action est irréversible. Toutes vos données seront supprimées définitivement.
        </Text>

        <TextInput
          label="Mot de passe actuel"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          label="Écrivez SUPPRIMER pour confirmer"
          value={confirmText}
          onChangeText={setConfirmText}
          mode="outlined"
          style={styles.input}
        />

        {error && (
          <Text style={styles.error} variant="bodyMedium">
            {error}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={() => setShowConfirmDialog(true)}
          loading={loading}
          disabled={!password || confirmText !== 'SUPPRIMER' || loading}
          style={styles.deleteButton}
          buttonColor="#B00020"
        >
          Supprimer mon compte
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Annuler
        </Button>

        <Portal>
          <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
            <Dialog.Title>Confirmation</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowConfirmDialog(false)}>Annuler</Button>
              <Button onPress={handleDeleteAccount} textColor="#B00020">
                Supprimer
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
  warning: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 16,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
  },
})
