import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text, Surface } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendOTP = async () => {
    try {
      // Validation de l'email
      if (!email.trim()) {
        setError('Veuillez entrer votre adresse email')
        return
      }

      if (!validateEmail(email)) {
        setError('Veuillez entrer une adresse email valide')
        return
      }

      setLoading(true)
      setError(null)
      setMessage(null)

      // Vérifier si l'utilisateur existe
        const { data: user, error:userError } = await supabase
        .from('profile')
        .select('id, email')
        .eq('email', email.toLowerCase())

      if (userError || !user) {
        throw new Error('Aucun compte associé à cette adresse email')
      }

      // Générer un code OTP à 4 chiffres
      const otp = Math.floor(1000 + Math.random() * 9000).toString()

      // Envoyer l'OTP par e-mail
      const { error } = await supabase
        .from('otp_codes')
        .insert([{ email, otp }]) // Assurez-vous d'avoir une table otp_codes pour stocker les OTP

      if (error) throw error

      // Envoyer un e-mail avec le code OTP (vous devez configurer cela dans votre backend)
      // Ici, vous pouvez utiliser un service d'envoi d'e-mails pour envoyer le code OTP

      setMessage('Un code de vérification a été envoyé à votre adresse email')

      // Naviguer vers la page de vérification OTP
      setTimeout(() => {
        navigation.navigate( 'VerifyOTP', { email, otp })
      }, 1500)

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
          Mot de passe oublié
        </Text>

        <Text variant="bodyMedium" style={styles.description}>
          Entrez votre adresse email pour recevoir un code de vérification
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text)
            setError(null) // Réinitialiser l'erreur lors de la saisie
          }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
          error={!!error}
        />

        {error && (
          <Text style={styles.error} variant="bodyMedium">
            {error}
          </Text>
        )}

        {message && (
          <Text style={styles.success} variant="bodyMedium">
            {message}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSendOTP}
          loading={loading}
          disabled={!email.trim() || loading}
          style={styles.button}
        >
          Envoyer le code
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={loading}
        >
          Retour à la connexion
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
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
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
