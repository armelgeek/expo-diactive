import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

export const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 28,
    paddingLeft: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  input: {
    flex: 1,
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Heading1.fontSize,
    color: '#000'
  },
  container: {},
  shadow: {
    shadowColor: AppColors.darkColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  text: {
    fontSize: FontSizes.Heading1.fontSize,
    paddingVertical: 5,
    color: AppColors.darkColor,
    fontFamily: FontWeights.Bold.fontFamily,
  },
});
