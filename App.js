import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from './src/hooks/useAuth'
import { ThemeProvider } from './src/context/ThemeContext'
import { I18nProvider } from './src/providers/I18nProvider'
import AppNavigator from './src/navigation/AppNavigator'
import { CartProvider } from './src/contexts/CartContext'

// Auth screens
import LoginScreen from './src/pages/auth/LoginScreen'
import RegisterScreen from './src/pages/auth/RegisterScreen'
import { ForgotPasswordScreen } from './src/pages/auth/ForgotPasswordScreen'
import { VerifyOTPScreen } from './src/pages/auth/VerifyOTPScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return null // Ou un écran de chargement
  }

  return (
    <I18nProvider>
      <ThemeProvider>
        <CartProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <Stack.Screen name="Main" component={AppNavigator} />
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen
                  name="VerifyOTP"
                  component={VerifyOTPScreen}
                  options={{ title: 'Vérifier le code OTP' }}
                />
              </>
            )}
          </Stack.Navigator>
        </CartProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}
