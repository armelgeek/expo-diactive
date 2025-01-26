import {Text, View} from 'react-native';
import React, { useState} from 'react';
import homeStyles from '../styles/home/homeStyle';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from 'react-native-elements';
function StepCounter() {
  const {user} = useAuth();

  const [count, setCount] = useState(0);
  const theme = useTheme();
  const [walkingTime, setWalkingTime] = useState(0);

  const handleStepUpdate = async (step) => {
    setCount(step);
  };

  const handleWalkingTimeUpdate = (time) => {
    setWalkingTime(time);
  };
  return (
    <View style={homeStyles.stepContainer}>
      <Text
        style={[
          homeStyles.steps,
          {
            color: '#000',
          },
        ]}>
        {count}
      </Text>
      <View style={homeStyles.label}>
        <Text style={homeStyles.labelStep}>Pas effectués </Text>
      </View>
    </View>
  );
}
export default StepCounter;
