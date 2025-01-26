import {Dimensions, StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';
const {width} = Dimensions.get('window');
const awardItemStyles = StyleSheet.create({
  item: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
  },
  cardContainer: {
    width: '100%',
    position: 'absolute',
    overflow: 'hidden',
    marginVertical: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  infoSection: {
    padding: 10,
  },
  nameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontFamily: FontWeights.Bold.fontFamily,
    color: '#fff',
  },
  companyName: {
    fontFamily: FontWeights.Bold.fontFamily,
    fontSize: FontSizes.Label.fontSize,
    color: '#777',
  },
  addButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00B66A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 15,
    color: '#FDC500',
  },
  bonusContainer: {
    alignSelf: 'flex-end',
    borderRadius: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fff',
    marginTop: 15,
    paddingHorizontal: 15,
  },
  bonusText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: FontWeights.Regular.fontFamily,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  ratingStar: {
    color: '#ffa500',
    marginRight: 2,
  },
  ratingStarDisabled: {
    color: '#d3d3d3',
    marginRight: 2,
  },
  rewardPoints: {
    marginTop: 5,
    color: '#00cc66',
    fontWeight: 'bold',
  },
  selectionCount: {
    fontSize: 12,
    fontFamily: FontWeights.Regular.fontFamily,
    color: AppColors.warning,
  },
  unavailableItem: {
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  overlayText: {
    color: 'white',
    fontSize: FontSizes.SubHeading.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
  },
  obtainBtn: {
    backgroundColor: AppColors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: AppColors.disabled,
  },
});

export default awardItemStyles;
