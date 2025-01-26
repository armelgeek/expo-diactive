import {StyleSheet} from 'react-native';
import {AppColors} from '../../theme';

const dateFilterStyle = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: AppColors.borderColor,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default dateFilterStyle;
