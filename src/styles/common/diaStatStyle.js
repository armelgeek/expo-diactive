import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

const diaStatStyle = StyleSheet.create({
  container: {
    width: '90%',
    height: 70,
    backgroundColor: '#000',
    paddingHorizontal: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: AppColors.borderColor,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  statText: {
    color: '#fff',
    fontFamily: FontWeights.Bold.fontFamily,
    fontSize: FontSizes.Heading2.fontSize,
    marginTop: 4,
  },
  menuText: {
    fontFamily: FontWeights.Light.fontFamily,
    fontSize: FontSizes.Body.fontSize,
    color: '#fff',
  },
  separator: {
    width: 2,
    height: 40,
    backgroundColor: '#fff',
  },
});

export default diaStatStyle;
