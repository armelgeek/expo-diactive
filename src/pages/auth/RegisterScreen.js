import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { AuthTemplate } from '../../templates/AuthTemplate'
import { LoginForm } from '../../molecules/LoginForm'
import { Button } from '../../atoms/Button'
import { supabase } from '../../services/supabase'

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {
    setLoading(true)
    try {

      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      })
      /**const profileData = {
        user_id: user.id,
        user_name: user.email.split('@')[0],
        points: 0,
        is_admin: false,
        activated: false,
        first_name: '',
        last_name: '',
        address: '',
        phone: '',
        email: email,
        avatar_url: 'default_avatar.png'
      }**/
      await supabase
        .from('profile')
        .insert(profileData)
        .select()
      if (error) throw error
      alert('Vérifiez votre email pour confirmer votre inscription!')
      navigation.navigate('Login')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthTemplate title="Inscription">
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={signUpWithEmail}
        loading={loading}
      />

      <Button
        title="Déjà inscrit ? Connectez-vous"
        type="clear"
        onPress={() => navigation.navigate('Login')}
      />
    </AuthTemplate>
  )
}
