import React, { useState } from 'react'
import { LoginForm } from '../../molecules/LoginForm'
import { Button } from '../../atoms/Button'
import { AuthTemplate } from '../../templates/AuthTemplate'
import { supabase } from '../../services/supabase'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthTemplate title="Diactive">
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={signInWithEmail}
        loading={loading}
      />
      
      <Button
        title="S'inscrire"
        type="clear"
        onPress={() => navigation.navigate('Register')}
      />
      <Button
        title="Mot de passe oublié ?"
        type="clear"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
    </AuthTemplate>
  )
} 