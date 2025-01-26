// styles/common/floatingMenu.ts

import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

const floatingMenu = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: AppColors.darkColor,
    borderRadius: 35,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: AppColors.borderColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    position: 'relative',
  },

  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 4,
  },

  menuImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FFFFFF80',
  },

  menuImageActive: {
    tintColor: AppColors.greenDiactiv
  },

  menuText: {
    color: '#FFFFFF80',
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Body1.fontSize,
    marginTop: 4,
  },

  menuTextActive: {
    color: AppColors.greenDiactiv,
    fontFamily: FontWeights.Bold.fontFamily,
  },

  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.greenDiactiv,
  },

  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FontWeights.Bold.fontFamily,
  },

  tooltip: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: AppColors.darkColor,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },

  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FontWeights.Regular.fontFamily,
  },

  tooltipArrow: {
    position: 'absolute',
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: AppColors.darkColor,
  },
});

export default floatingMenu;
