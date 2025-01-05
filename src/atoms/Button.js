import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as RNEButton } from 'react-native-elements'

export const Button = ({ 
  title, 
  onPress, 
  loading, 
  type = 'solid',
  ...props 
}) => {
  return (
    <RNEButton
      title={title}
      onPress={onPress}
      loading={loading}
      type={type}
      containerStyle={styles.container}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 8,
  }
}) 