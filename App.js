import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from './src/hooks/useAuth'

// Navigation
import AppNavigator from './src/navigation/AppNavigator'

// Auth screens
import LoginScreen from './src/pages/auth/LoginScreen'
import RegisterScreen from './src/pages/auth/RegisterScreen'
import {ForgotPasswordScreen} from './src/pages/auth/ForgotPasswordScreen'
import { CartProvider } from './src/contexts/CartContext'
import { PaperProvider } from 'react-native-paper'
import { VerifyOTPScreen } from './src/pages/auth/VerifyOTPScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return null // Ou un écran de chargement
  }

  return (
    <PaperProvider>
    <CartProvider>
    <NavigationContainer>
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
    </NavigationContainer>
    </CartProvider>
    </PaperProvider>
  )
} 