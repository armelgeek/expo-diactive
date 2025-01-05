import React from 'react'
import { StyleSheet } from 'react-native'
import { Input as RNEInput } from 'react-native-elements'

export const Input = ({ 
  placeholder, 
  value, 
  onChangeText,
  secureTextEntry,
  ...props 
}) => {
  return (
    <RNEInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      containerStyle={styles.container}
      inputContainerStyle={styles.inputContainer}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 0,
  }
}) 