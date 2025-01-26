import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

export const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    width: '50%',
    color: '#000'
  },
  text: {
    fontSize: FontSizes.Heading2.fontSize,
    color: AppColors.darkColor,
    fontFamily: FontWeights.Bold1.fontFamily,
    marginBottom: 3,
  },
});
