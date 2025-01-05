import React from 'react';
import { Text } from 'react-native-paper';

export const CustomText = ({
  variant = 'bodyMedium',
  style,
  children,
  ...props
}) => {
  return (
    <Text
      variant={variant}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}; 