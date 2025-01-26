import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import floatingMenu from '../styles/common/floatingMenu';
import resources from '../resources/resources';
import {useNavigation, useRoute} from '@react-navigation/native';

const menuItems = [
  {
    id: 'home',
    label: 'Activité',
    icon: resources.icons.walking,
    screen: 'Home',
  },
  {
    id: 'social',
    label: 'Sociale',
    icon: resources.icons.social,
    screen: 'Social',
  },
  {
    id: 'awards',
    label: 'Coffre +',
    icon: resources.icons.foot,
    screen: 'Awards',
  },
  {
    id: 'plans',
    label: 'Bon Plan',
    icon: resources.icons.shopping,
    screen: 'GoodPlan',
  },
];

export const FloatingTabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActiveScreen = (screenName) => {
    return route.name === screenName;
  };

  const getMenuItemStyle = (screenName) => {
    const isActive = isActiveScreen(screenName);
    return {
      ...floatingMenu.menuItem,
      ...(isActive && floatingMenu.menuItemActive),
    };
  };

  const getMenuTextStyle = (screenName) => {
    const isActive = isActiveScreen(screenName);
    return {
      ...floatingMenu.menuText,
      ...(isActive && floatingMenu.menuTextActive),
    };
  };

  const getMenuImageStyle = (screenName) => {
    const isActive = isActiveScreen(screenName);
    return {
      ...floatingMenu.menuImage,
      ...(isActive && floatingMenu.menuImageActive),
    };
  };

  return (
    <View style={floatingMenu.container}>
      {menuItems.map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() => navigation.navigate(item.screen)}
          style={getMenuItemStyle(item.screen)}>
          <View style={floatingMenu.iconContainer}>
            <Image source={item.icon} style={getMenuImageStyle(item.screen)} />
            {isActiveScreen(item.screen) && (
              <View style={floatingMenu.activeIndicator} />
            )}
          </View>
          <Text style={getMenuTextStyle(item.screen)}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

