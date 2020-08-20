import { NativeModules, Platform } from 'react-native';

import Colors from './Colors';
import Layout from './Layout';

export const oneWeek = 6.048e8;
export const oneMonth = 2.628e9;
export const oneYear = 3.154e10;

export const tokenForTag = '\u200B';
export const separatorForTag = '\u01B1';

export const pendingPostID = 'pending-post-69';
export const pendingDeletePostFlag = '--pending-delete-post';
export const pendingCommentID = 'pending-comment-69';
export const pendingDeleteCommentFlag = '--pending-delete-comment';
export const pendingReplyID = 'pending-reply-69';
export const pendingDeleteReplyFlag = '--pending-delete-reply';

export { Colors, Layout };
export * from './Icons';

const { RNDeviceInfo } = NativeModules;

const devicesWithNotch = [
  {
    brand: 'Apple',
    model: 'iPhone 11',
  },
  {
    brand: 'Apple',
    model: 'iPhone 11 Pro',
  },
  {
    brand: 'Apple',
    model: 'iPhone 11 Pro Max',
  },
  {
    brand: 'Apple',
    model: 'iPhone X',
  },
  {
    brand: 'Apple',
    model: 'iPhone XS',
  },
  {
    brand: 'Apple',
    model: 'iPhone XS Max',
  },
  {
    brand: 'Apple',
    model: 'iPhone XR',
  },
  {
    brand: 'Asus',
    model: 'ZenFone 5',
  },
  {
    brand: 'Asus',
    model: 'ZenFone 5z',
  },
  {
    brand: 'google',
    model: 'Pixel 3 XL',
  },
  {
    brand: 'Huawei',
    model: 'P20',
  },
  {
    brand: 'Huawei',
    model: 'P20 Plus',
  },
  {
    brand: 'Huawei',
    model: 'P20 Lite',
  },
  {
    brand: 'Huawei',
    model: 'ANE-LX1',
  },
  {
    brand: 'Huawei',
    model: 'INE-LX1',
  },
  {
    brand: 'Huawei',
    model: 'POT-LX1',
  },
  {
    brand: 'Huawei',
    model: 'Honor 10',
  },
  {
    brand: 'Huawei',
    model: 'Mate 20 Lite',
  },
  {
    brand: 'Huawei',
    model: 'Mate 20 Pro',
  },
  {
    brand: 'Huawei',
    model: 'ELE-L29', // P30
  },
  {
    brand: 'Huawei',
    model: 'P30 Lite',
  },
  {
    brand: 'Huawei',
    model: 'P30 Pro',
  },
  {
    brand: 'Huawei',
    model: 'Nova 3',
  },
  {
    brand: 'Huawei',
    model: 'Nova 3i',
  },
  {
    brand: 'Leagoo',
    model: 'S9',
  },
  {
    brand: 'LG',
    model: 'G7',
  },
  {
    brand: 'LG',
    model: 'G7 ThinQ',
  },
  {
    brand: 'LG',
    model: 'G7+ ThinQ',
  },
  {
    brand: 'LG',
    model: 'LM-Q910', //G7 One
  },
  {
    brand: 'LG',
    model: 'LM-G710', //G7 ThinQ
  },
  {
    brand: 'LG',
    model: 'LM-V405', //V40 ThinQ
  },
  {
    brand: 'Motorola',
    model: 'Moto g7 Play',
  },
  {
    brand: 'Motorola',
    model: 'Moto g7 Power',
  },
  {
    brand: 'Motorola',
    model: 'One',
  },
  {
    brand: 'Motorola',
    model: 'Motorola One Vision',
  },
  {
    brand: 'Nokia',
    model: '5.1 Plus',
  },
  {
    brand: 'Nokia',
    model: 'Nokia 6.1 Plus',
  },
  {
    brand: 'Nokia',
    model: '7.1',
  },
  {
    brand: 'Nokia',
    model: '8.1',
  },
  {
    brand: 'OnePlus',
    model: '6',
  },
  {
    brand: 'OnePlus',
    model: 'A6003',
  },
  {
    brand: 'ONEPLUS',
    model: 'A6000',
  },
  {
    brand: 'OnePlus',
    model: 'OnePlus A6003',
  },
  {
    brand: 'OnePlus',
    model: 'ONEPLUS A6010',
  },
  {
    brand: 'OnePlus',
    model: 'ONEPLUS A6013',
  },
  {
    brand: 'OnePlus',
    model: 'ONEPLUS A6000',
  },
  {
    brand: 'Oppo',
    model: 'R15',
  },
  {
    brand: 'Oppo',
    model: 'R15 Pro',
  },
  {
    brand: 'Oppo',
    model: 'F7',
  },
  {
    brand: 'Oukitel',
    model: 'U18',
  },
  {
    brand: 'Sharp',
    model: 'Aquos S3',
  },
  {
    brand: 'Vivo',
    model: 'V9',
  },
  {
    brand: 'Vivo',
    model: 'X21',
  },
  {
    brand: 'Vivo',
    model: 'X21 UD',
  },
  {
    brand: 'xiaomi',
    model: 'MI 8',
  },
  {
    brand: 'xiaomi',
    model: 'MI 8 Explorer Edition',
  },
  {
    brand: 'xiaomi',
    model: 'MI 8 SE',
  },
  {
    brand: 'xiaomi',
    model: 'MI 8 UD',
  },
  {
    brand: 'xiaomi',
    model: 'MI 8 Lite',
  },
  {
    brand: 'xiaomi',
    model: 'Mi 9',
  },
  {
    brand: 'xiaomi',
    model: 'POCO F1',
  },
  {
    brand: 'xiaomi',
    model: 'POCOPHONE F1',
  },
  {
    brand: 'xiaomi',
    model: 'Redmi 6 Pro',
  },
  {
    brand: 'xiaomi',
    model: 'Redmi Note 7',
  },
  {
    brand: 'xiaomi',
    model: 'Redmi Note 8',
  },
  {
    brand: 'xiaomi',
    model: 'Mi A2 Lite',
  },
  {
    brand: 'Blackview',
    model: 'A30',
  },
];

function getBrand() {
  let brand = '';
  if (
    Platform.OS === 'android' ||
    Platform.OS === 'ios' ||
    Platform.OS === 'windows'
  ) {
    brand = RNDeviceInfo.brand;
  } else {
    brand = 'unknown';
  }
  return brand;
}

function getModel() {
  let model = '';
  if (
    Platform.OS === 'ios' ||
    Platform.OS === 'android' ||
    Platform.OS === 'windows'
  ) {
    model = RNDeviceInfo.model;
  } else {
    model = 'unknown';
  }
  return model;
}

function hasNotch() {
  let notch = false;
  const brand = getBrand();
  const model = getModel();
  notch =
    devicesWithNotch.findIndex(
      (item) =>
        item.brand.toLowerCase() === brand.toLowerCase() &&
        item.model.toLowerCase() === model.toLowerCase(),
    ) !== -1;
  return notch;
}

export const bottomTabHeight = hasNotch() ? 79 : 50;
