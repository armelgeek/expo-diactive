import React from 'react'
import { View, Text } from 'react-native'
import { IconButton } from 'react-native-paper'

const DashboardScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Tableau de bord</Text>
      <IconButton
        icon="cart"
        onPress={() => navigation.navigate('Cart')}
      />
    </View>
  )
}

export default DashboardScreen 