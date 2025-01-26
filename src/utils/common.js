import {Dimensions, PixelRatio, ToastAndroid} from 'react-native';

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

const fontScale = PixelRatio.getFontScale();
const pixelRatio = PixelRatio.get();
const PPI = 2;
const iphoneWidth = 750 / PPI;
const scaleWidth = windowWidth / iphoneWidth;
const scaleHeight = windowHeight / iphoneWidth;

export function formatTime() {
  let time = new Date();
  let week = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];
  time.getFullYear();
  let month = time.getMonth(),
    date = time.getDate(),
    day = time.getDay();
  return `${month}/${date} ${week[day]}`;
}

export function pxToDp(size) {
  size = Math.round(size * scaleWidth);
  return size / PPI;
}
export function setSpText(size) {
  const scale = Math.min(scaleWidth, scaleHeight);
  size = Math.round((size * scale * pixelRatio) / fontScale);
  return size;
}

export const toast = (
  message,
  duration = 'short',
  position = 'bottom',
) => {
  let _duration;
  switch (duration) {
    case 'long':
      _duration = ToastAndroid.LONG;
      break;
    case 'short':
    default:
      _duration = ToastAndroid.SHORT;
      break;
  }
  let _position;
  switch (position) {
    case 'top':
      _position = ToastAndroid.TOP;
      break;
    case 'center':
      _position = ToastAndroid.CENTER;
      break;
    case 'bottom':
    default:
      _position = ToastAndroid.BOTTOM;
      break;
  }
  ToastAndroid.showWithGravity(message, _duration, _position);
};

export const convertWalkingTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds.toFixed(0)} s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toFixed(0)} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    return `${hours.toFixed(0)} h`;
  }
};

export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters >= 1000) {
    const distanceInKm = distanceInMeters / 1000;
    return `${distanceInKm.toFixed(2)} km`;
  } else {
    return `${distanceInMeters.toFixed(0)} m`;
  }
};

export function throttle(
  fn,
  delay = 100,
) {
  let timer = null;
  let _args;
  return (...args) => {
    _args = args;
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      void fn(..._args);
    }, delay);
  };
}

export function generateUuid() {
  let u = '',
    i = 0;
  while (i++ < 36) {
    let c = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'[i - 1],
      r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    u += c == '-' || c == '4' ? c : v.toString(16);
  }
  return u;
}
