import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Overlay as RNEOverlay } from 'react-native-elements'

export const CustomOverlay = ({
  isVisible = false,
  onBackdropPress = () => {},
  overlayStyle = {},
  children,
  ...props
}) => {
  return (
    <RNEOverlay
      isVisible={isVisible}
      onBackdropPress={onBackdropPress}
      overlayStyle={[styles.overlay, overlayStyle]}
      {...props}
    >
      {children}
    </RNEOverlay>
  )
}

const styles = StyleSheet.create({
  overlay: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
  },
}) 