import {StyleSheet, Dimensions} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

const {width} = Dimensions.get('window');

const floatingMenu = StyleSheet.create({
  container: {
    width,
    height: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    gap: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  menuImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuText: {
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.SubHeading.fontSize,
  },
  imageContainer: {
    width: 32,
    height: 32,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.lightColor,
  },

  notification: {
    position: 'relative',
    marginLeft: 5,
    marginRight: 10,
  },
  diaCountContainer: {},
  counter: {
    width: 20,
    height: 20,
    borderRadius: 20,
    textAlign: 'center',
    color: '#fff',
    paddingTop: 1,
    fontSize: FontSizes.Body.fontSize,
    fontFamily: FontWeights.Regular.fontFamily,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    position: 'absolute',
    right: -10,
  },
  badgeCounter: {
    backgroundColor: AppColors.darkColor,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: AppColors.borderColor,
  },
  diaCount: {
    color: '#fff',
    fontSize: FontSizes.Heading2.fontSize,
    fontFamily: FontWeights.Regular.fontFamily,
  },
  litter: {
    color: '#fff',
    fontSize: FontSizes.Heading2.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
  },
});

export default floatingMenu;
