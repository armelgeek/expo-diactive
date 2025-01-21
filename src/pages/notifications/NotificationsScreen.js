import React from 'react'
import { View, StyleSheet } from 'react-native'
import { NotificationList } from '../../molecules/NotificationList'

export const NotificationsScreen = () => {
  return (
    <View style={styles.container}>
      <NotificationList />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
