import { useState } from "react";
import homeStyles from "../styles/home/homeStyle";
import { View , Text } from "react-native";

function DiaCompare() {
	const [state, setState] = useState(1);
	const [period, setPeriod] = useState('daily');
	return (
	  <View style={{marginVertical: 15, paddingHorizontal: 15}}>
		<Text
		  style={[
			homeStyles.instruction,
			{
			  marginBottom: 0,
			},
		  ]}>
		  {state === 1 && (
			<>
			  <Text>Vous avez fait</Text>{' '}
			  <Text style={homeStyles.bold}>
				{period === 'weekly' ? 'encore plus' : 'encore plus'}{' '}
				{period === 'weekly'
				  ? 'que la semaine dernière'
				  : period === 'monthly'
				  ? 'que le mois dernier'
				  : 'qu’hier'}
			  </Text>{' '}
			  continuez comme ça.
			</>
		  )}
		  {state === 2 && (
			<>
			  <Text>Vous avez fait</Text>{' '}
			  <Text style={homeStyles.bold}>
				{period === 'weekly' ? 'moins' : 'moins'}{' '}
				{period === 'weekly'
				  ? 'que la semaine dernière'
				  : period === 'monthly'
				  ? 'que le mois dernier'
				  : 'qu’hier'}
			  </Text>{' '}
			  essayez de vous surpasser !
			</>
		  )}
		  {state === 3 && (
			<>
			  <Text>Vous avez fait</Text>{' '}
			  <Text style={homeStyles.bold}>
				{period === 'weekly' ? 'le même nombre' : 'le même nombre'}{' '}
				{period === 'weekly'
				  ? 'que la semaine dernière'
				  : period === 'monthly'
				  ? 'que le mois dernier'
				  : 'qu’hier'}
			  </Text>{' '}
			  bon travail !
			</>
		  )}
		</Text>
	  </View>
	);
  }
export default DiaCompare;
