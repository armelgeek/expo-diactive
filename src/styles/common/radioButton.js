import {StyleSheet} from 'react-native';
import {FontWeights} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  containerVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2e2e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioCircle: {
    borderColor: '#4caf50',
  },
  selectedDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
  },
  labelContainer: {
    flex: 1,
    fontFamily: FontWeights.Regular.fontFamily,
  },
});
