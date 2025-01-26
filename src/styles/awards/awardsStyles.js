import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

const awardsStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: FontSizes.Heading.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.darkColor
  },
  search: {
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSizes.Heading1.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.darkColor,
  },
  productListContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginVertical: 15,
    backgroundColor: '#ffff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default awardsStyles;
