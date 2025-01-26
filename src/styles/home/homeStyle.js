import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 120,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayAndAverage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  day: {
    marginLeft: 20,
    fontFamily: FontWeights.Bold.fontFamily,
    fontSize: FontSizes.SubHeading.fontSize
  },
  averageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  average: {
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.SubHeading.fontSize,
  },
  averageKm: {
    fontFamily: FontWeights.Bold.fontFamily,
    fontSize: FontSizes.Label.fontSize,
    color: AppColors.normal,
  },
  stepContainer: {
    position: 'relative',
    flexDirection: 'row',
    borderRadius: 5,
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingTop: 24,
  },
  steps: {
    fontSize: 45,
    position: 'absolute',
    top: 0,
    fontFamily: FontWeights.Bold.fontFamily,
  },
  label: {
    fontSize: FontSizes.Heading.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: 4,
    marginLeft: 55,
  },
  labelStep: {
    color: AppColors.warning,
    fontFamily: FontWeights.Bold.fontFamily,
    fontSize: FontSizes.Heading1.fontSize,
  },
  duration: {
    color: AppColors.primary1,
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Label.fontSize,
  },
  instruction: {
    textTransform: 'capitalize',
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Heading1.fontSize,
    textAlign: 'center',
    marginBottom: 35,
    color: '#000'
  },
  bold: {
    fontSize: FontSizes.Heading1.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
  },
});

export default homeStyles;
