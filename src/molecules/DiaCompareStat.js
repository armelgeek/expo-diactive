import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import diaStatStyle from '../styles/common/diaStatStyle';
import { formatDistance } from '../utils/common';
import { AppColors } from '../theme';


const DiaCompareStat = () => {
	const [state, setState] = useState(0);
	const [calor, setCalor] = useState(0);
	const [distance, setDistance] = useState(0);
	const [points, setPoints] = useState(0);

	const handleUpdate = ({
		caloriesBurned,
		distance,
		diaPoints,
	}) => {
		setCalor(caloriesBurned);
		setDistance(distance);
		setPoints(diaPoints);
	};



	const getBgColor = () => {
		switch (state) {
			case 1:
				return AppColors.danger;
			case 2:
				return AppColors.greenDiactiv;
			case 3:
				return AppColors.normal;
			default:
				return AppColors.normal;
		}
	};

	return (
		<View
			style={[
				diaStatStyle.container,
				{
					backgroundColor: getBgColor(),
				},
			]}>
			<TouchableOpacity style={diaStatStyle.menuItem}>
				<Text style={[diaStatStyle.statText]}>
					{formatDistance(distance * 1)}
				</Text>
				<Text style={[diaStatStyle.menuText]}>Distance</Text>
			</TouchableOpacity>
			<View style={diaStatStyle.separator} />
			<TouchableOpacity style={[diaStatStyle.menuItem]}>
				<Text style={diaStatStyle.statText}>{calor.toFixed(0)} Kcal</Text>
				<Text style={[diaStatStyle.menuText]}>Calories</Text>
			</TouchableOpacity>
			<View style={diaStatStyle.separator} />
			<TouchableOpacity style={[diaStatStyle.menuItem]}>
				<Text style={[diaStatStyle.statText]}>{points.toFixed(2)} BONI</Text>
				<Text style={[diaStatStyle.menuText]}>Gagnés</Text>
			</TouchableOpacity>
			<View style={diaStatStyle.separator} />
			<TouchableOpacity style={[diaStatStyle.menuItem]}>
				<Text style={[diaStatStyle.statText]}>0</Text>
				<Text style={[diaStatStyle.menuText]}>Pas validés</Text>
			</TouchableOpacity>
		</View>
	);
};

export default DiaCompareStat;
