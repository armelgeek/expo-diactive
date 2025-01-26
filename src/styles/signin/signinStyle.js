import {StyleSheet} from 'react-native';
import { AppColors, FontSizes, FontWeights } from "../../theme";

export const styles = StyleSheet.create({
  illustration: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 70,
    paddingVertical: 10,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  text: {
    fontSize: FontSizes.Heading1.fontSize,
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 50,
  },
  formErrorText: {
    color: AppColors.danger,
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Body.fontSize,
    textAlign: 'center',
  },

  // Styles pour l'animation du bouton
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: 25,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingSpinner: {
    marginRight: 10,
  },

  successMessage: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: AppColors.greenDiactiv,
    borderRadius: 4,
    padding: 10,
    marginVertical: 10,
  },

  successText: {
    color: AppColors.greenDiactiv,
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Body.fontSize,
    textAlign: 'center',
  },

  spacer: {
    height: 15,
  },

  horizontalSpacer: {
    width: 10,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
