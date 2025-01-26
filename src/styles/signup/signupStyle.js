import {StyleSheet} from 'react-native';
import {AppColors, FontSizes, FontWeights} from '../../theme';

export const styles = StyleSheet.create({
  illustration: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  passwordContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    marginVertical: 20,
  },
  text: {
    fontSize: 15,
    fontFamily: FontWeights.Regular.fontFamily,
  },
  cguLabel: {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: FontWeights.Regular.fontFamily,
    gap: 5,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  formContainer: {
    marginVertical: 15,
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: AppColors.danger,
    textAlign: 'right',
    marginBottom: 10,
    fontFamily: FontWeights.Regular.fontFamily,
  },
  inputError: {
    borderColor: AppColors.danger,
    borderWidth: 2,
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: FontWeights.Regular.fontFamily,
  },
  passwordCriteria: {
    marginTop: 8,
    marginBottom: 12,
    paddingLeft: 8,
  },
  criterionText: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: FontWeights.Regular.fontFamily,
  },
  cguContainer: {
    marginVertical: 15,
  },

  cguText: {
    fontFamily: FontWeights.Regular.fontFamily,
    color: '#000',
    marginRight: 4,
  },
  cguLink: {
    fontFamily: FontWeights.Regular.fontFamily,
    color: AppColors.greenDiactiv,
  },
  footerText: {
    color: '#000',
    fontFamily: FontWeights.Regular.fontFamily,
    marginRight: 4,
    fontSize: FontSizes.Body.fontSize,
  },
  footerLink: {
    color: AppColors.greenDiactiv,
    fontFamily: FontWeights.Regular.fontFamily,
    fontSize: FontSizes.Body.fontSize,
  },
});
