import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import resources from '../resources/resources';
import headerMenu from '../styles/common/headerMenu';

const UserAccount = ({ username, userIcon, isAuthenticated }) => {
	const theme = useTheme();
	const navigation = useNavigation();

	return (
		<TouchableOpacity
			style={headerMenu.menuItem}
			onPress={() => isAuthenticated ? navigation.navigate('Profile') : navigation.navigate('SignUp')}
		>
			<View style={headerMenu.imageContainer}>
				<Image source={userIcon} style={headerMenu.menuImage} />
			</View>
			<Text style={[headerMenu.menuText]}>
				{username.length > 20 ? `${username.substring(0, 20)}...` : username}
			</Text>
		</TouchableOpacity>
	);
};

export default UserAccount;
