import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Input, Button, Text } from 'react-native-elements'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useDemo } from '../../hooks/useDemo'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loading } = useAuth()
  const { enableDemoMode } = useDemo()

  const handleDemoMode = async () => {
    await enableDemoMode()
    // La navigation sera gérée automatiquement via useAuth
  }

  const handleLogin = async () => {
    try {
      await signIn(email, password)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text h3 style={styles.header}>DevBlock</Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Se connecter"
        onPress={handleLogin}
        loading={loading}
      />
      <Button
        title="S'inscrire"
        type="clear"
        onPress={() => navigation.navigate('Register')}
      />
      <Button
        title="Essayer en mode démo"
        type="clear"
        onPress={handleDemoMode}
        containerStyle={styles.demoButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  demoButton: {
    marginTop: 20,
  },
}) 