import {Text, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import { useTheme } from 'react-native-elements';
import homeStyles from '../styles/home/homeStyle';
import { useAuth } from '../hooks/useAuth';
import HexagonButton from '../atoms/HexagonButton';
import { AppColors } from '../theme';
function CallAction({children}) {
  const theme = useTheme();
  const navigation = useNavigation();
  const {isAuthenticated, updateUserPoints} = useAuth();
  const [loading, setLoading] = useState(false);
  const validateStepRef = useRef(null);
  const guestUserInfoRef = useRef(null);

  return (
    <>
      <Text
        style={[
          homeStyles.instruction,
          {
            color: '#000',
          },
        ]}>
        <Text style={homeStyles.bold}>Cliquez</Text> sur le bouton ci-dessous{' '}
        {'\n'}
        pour{' '}
        <Text style={homeStyles.bold}>
          {!isAuthenticated ? "tester l'application" : 'valider vos pas'}
        </Text>
        .
      </Text>

      {isAuthenticated ? (
        <View style={{flexDirection: 'row', justifyContent:'center'}}>{children}</View>
      ) : (
        <HexagonButton
          variant="medium"
          text="Tester"
          color={AppColors.warning}
        //  onPress={() => guestUserInfoRef.current?.show()}
        />
      )}
    </>
  );
}
export default CallAction;
