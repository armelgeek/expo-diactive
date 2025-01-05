import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'

export const ProfileForm = ({ 
  username,
  setUsername,
  fullName,
  setFullName,
  phone,
  setPhone,
  onSubmit,
  loading 
}) => {
  return (
    <View style={styles.container}>
      <Input
        placeholder="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Input
        placeholder="Nom complet"
        value={fullName}
        onChangeText={setFullName}
      />
      <Input
        placeholder="Téléphone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Button
        title="Mettre à jour le profil"
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