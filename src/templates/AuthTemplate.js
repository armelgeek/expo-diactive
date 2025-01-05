import React from 'react'
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text } from 'react-native-elements'

export const AuthTemplate = ({ children, title }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <Text h3 style={styles.header}>{title}</Text>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
}) 