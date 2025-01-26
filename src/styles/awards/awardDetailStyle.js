import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';
const awardDetailStyles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginVertical: 20,
    backgroundColor: '#ffff',
    paddingHorizontal: 20,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    height: '100%',
    width: '100%',
    top: '38%',
    position: 'absolute',
  },
  item: {
    marginTop: 40,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: 200,
  },
  ratingContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 50,
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
  content: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  pointsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  pointsText: {
    fontFamily: FontWeights.Bold.fontFamily,
    fontSize: FontSizes.Heading1.fontSize,
    color: AppColors.warning,
  },
  pointsRestant: {
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Heading1.fontSize,
    color: AppColors.darkColor,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.darkColor,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FontWeights.Regular.fontFamily,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    color: AppColors.darkColor,
    marginBottom: 20,
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Body.fontSize,
  },
  totalPointsLabel: {
    fontSize: FontSizes.Heading2.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.greenDiactiv,
  },
  totalPoints: {
    fontSize: FontSizes.Heading1.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.darkColor,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  buttonObtain: {
    backgroundColor: AppColors.darkColor,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: 150,
  },
  buttonDonate: {
    backgroundColor: AppColors.greenDiactiv,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: 150,
  },
  buttonText: {
    color: '#fff',
    fontFamily: FontWeights.Bold.fontFamily,
    textAlign: 'center',
  },
  returnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  returnIcon: {
    fontFamily: FontWeights.Bold.fontFamily,
    fontWeight: '500',
    fontSize: FontSizes.SubHeading.fontSize,
    color: AppColors.greenDiactiv,
  },
  returnLink: {
    textAlign: 'center',
    fontSize: FontSizes.SubHeading.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.darkColor,
  },
  iconTextContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  count: {
    color: AppColors.darkColor,
    fontSize: FontSizes.Heading1.fontSize,
    fontFamily: FontWeights.Bold.fontFamily,
  },
  centeredView: {},
  modalView: {
    backgroundColor: 'white',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: -10,
    top: -15,
  },
  closeButtonText: {
    fontSize: 12,
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.darkColor,
  },
  carsImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  congratsText: {
    fontSize: 24,
    fontFamily: FontWeights.Bold.fontFamily,
    color: AppColors.greenDiactiv,
    marginVertical: 10,
  },
  descriptionText: {
    textAlign: 'center',
    fontFamily: FontWeights.Regular.fontFamily,
    marginBottom: 15,
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.greenDiactiv,
    width: '100%',
    marginVertical: 15,
  },
  pointsNumber: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
  },
  obtainBtn: {
    backgroundColor: AppColors.greenDiactiv,
    paddingVertical: 15,
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: AppColors.lightColor,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FontSizes.Heading2,
    fontFamily: FontWeights.Bold.fontFamily,
    marginHorizontal: 20,
  },
  awardImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});

export default awardDetailStyles;
