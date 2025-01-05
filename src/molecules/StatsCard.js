import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text } from 'react-native-elements'

export const StatsCard = ({ title, value, subtitle }) => {
  return (
    <Card containerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text h3 style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
}) 