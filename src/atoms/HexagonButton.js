import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {AppColors, FontWeights} from '../theme';

const sizes = {
  extraSmall: {
    width: 110,
    height: 24,
    borderRadius: 12,
    fontSize: 10,
  },
  small: {
    width: 155,
    height: 32,
    borderRadius: 20,
    fontSize: 12,
  },
  medium: {
    width: 185,
    height: 35,
    borderRadius: 17.5,
    fontSize: 16,
  },
  large: {
    width: 310,
    height: 45,
    borderRadius: 25,
    fontSize: 16,
  },
};


const HexagonButton = ({
  variant = 'small',
  text,
  color = AppColors.danger,
  textColor = 'white',
  onPress,
  disabled = false,
  ...props
}) => {
  const size = sizes[variant];

  const styles = StyleSheet.create({
    button: {
      width: size.width,
      height: size.height,
      borderRadius: size.borderRadius,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: textColor,
      fontFamily: FontWeights.Bold.fontFamily,
      fontSize: size.fontSize,
      fontWeight: '800',
    },
  });

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.button, {...props.style}]}
      onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

export default HexagonButton;
