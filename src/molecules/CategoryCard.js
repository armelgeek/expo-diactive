import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const CategoryCard = ({ name, icon, selected, onPress }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        selected && styles.selected
      ]} 
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon || 'dots-horizontal'}
        size={30}
        color={selected ? '#fff' : '#2089dc'}
      />
      <Text 
        variant="labelLarge" 
        style={[
          styles.name,
          selected && styles.selectedText
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selected: {
    backgroundColor: '#2089dc',
  },
  name: {
    marginTop: 8,
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
  },
}) 