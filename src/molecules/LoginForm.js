import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'

export const LoginForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  onSubmit,
  loading 
}) => {
  return (
    <View style={styles.container}>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Se connecter"
        onPress={onSubmit}
        loading={loading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  }
}) 