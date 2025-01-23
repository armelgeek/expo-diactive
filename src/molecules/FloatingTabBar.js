import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import { useTheme } from '../context/ThemeContext'
import { useNavigation } from '@react-navigation/native'

export const FloatingTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.jumpTo('Dashboard')}
        >
          <Icon
            name="directions-walk"
            type="material"
            size={24}
            color={state.index === 0 ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.jumpTo('Social')}
        >
          <Icon
            name="people"
            type="material"
            size={24}
            color={state.index === 1 ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.jumpTo('Rewards')}
        >
          <Icon
            name="emoji-events"
            type="material"
            size={24}
            color={state.index === 2 ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.jumpTo('Marketplace')}
        >
          <Icon
            name="store"
            type="material"
            size={24}
            color={state.index === 3 ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	tabBar: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		height: 64,
		borderRadius: 32,
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
	},
	tabItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
