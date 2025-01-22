import React from 'react'
import { View, StyleSheet } from 'react-native'
import { NotificationButton } from './NotificationButton'
import { ThemeToggle } from './ThemeToggle'

export const HeaderButtons = () => {
  return (
    <View style={styles.container}>
      <ThemeToggle />
      <NotificationButton />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
