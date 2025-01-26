import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'

const lightColors = {
	primary: '#2089dc',
	secondary: '#03dac6',
	background: '#f5f5f5',
	surface: '#ffffff',
	error: '#B00020',
	text: '#000000',
	onSurface: '#000000',
	disabled: '#C4C4C4',
	placeholder: '#6B6B6B',
	backdrop: 'rgba(0, 0, 0, 0.5)',
	notification: '#f50057',
	card: '#ffffff',
	border: '#e1e1e1'
}

const darkColors = {
	primary: '#BB86FC',
	secondary: '#03dac6',
	background: '#121212',
	surface: '#1E1E1E',
	error: '#CF6679',
	text: '#FFFFFF',
	onSurface: '#FFFFFF',
	disabled: '#6B6B6B',
	placeholder: '#9E9E9E',
	backdrop: 'rgba(0, 0, 0, 0.5)',
	notification: '#f50057',
	card: '#1E1E1E',
	border: '#2C2C2C'
}

export const lightTheme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme.colors,
		...lightColors,
	},
	dark: false,
}

export const darkTheme = {
	...MD3DarkTheme,
	colors: {
		...MD3DarkTheme.colors,
		...darkColors,
	},
	dark: true,
}

export const getTheme = (isDark = false) => {
	return isDark ? darkTheme : lightTheme
}

import {AppColors} from './Colors';
import {FontWeights, FontSizes, BorderWidths, BorderRadius} from './Typography';

export {AppColors, FontWeights, FontSizes, BorderWidths, BorderRadius};
