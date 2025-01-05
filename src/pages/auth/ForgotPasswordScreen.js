import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { AuthTemplate } from '../../templates/AuthTemplate'
import { Input } from '../../atoms/Input'
import { Button } from '../../atoms/Button'
import { supabase } from '../../services/supabase'

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function resetPassword() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      alert('Vérifiez votre email pour réinitialiser votre mot de passe!')
      navigation.navigate('Login')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthTemplate title="Mot de passe oublié">
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <Button
        title="Réinitialiser le mot de passe"
        onPress={resetPassword}
        loading={loading}
      />
      
      <Button
        title="Retour à la connexion"
        type="clear"
        onPress={() => navigation.navigate('Login')}
      />
    </AuthTemplate>
  )
} 