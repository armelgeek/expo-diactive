import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import homeStyles from '../styles/home/homeStyle';
import { useTheme } from 'react-native-elements';
function DayAndAverage() {
  const theme = useTheme();
  const [averageSpeed, setAverageSpeed] = useState(0);

  const handleAverageUpdate = (avg) => {
    setAverageSpeed(avg);
  };


  return (
    <View style={[homeStyles.dayAndAverage]}>
      <Text
        style={[
          homeStyles.day,
          {
            color: '#000',
          },
        ]}>
        Aujourd’hui
      </Text>
      <View style={homeStyles.averageContainer}>
        <Text
          style={[
            homeStyles.average,
            {
              color: '#000',
            },
          ]}>
          Distance:
        </Text>
        <Text
          style={[
            homeStyles.averageKm,
            {
              color: '#000',
            },
          ]}>
          0 km
        </Text>
      </View>
    </View>
  );
}
export default DayAndAverage;
