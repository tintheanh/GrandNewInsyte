import { Dimensions, Platform, StatusBar } from 'react-native';

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

const { height, width } = Dimensions.get('window');

const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

export const isIPhoneX = () =>
  Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? (width === X_WIDTH && height === X_HEIGHT) ||
      (width === XSMAX_WIDTH && height === XSMAX_HEIGHT)
    : false;

export const StatusBarHeight = Platform.select({
  ios: isIPhoneX() ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0,
});

export const bottomTabHeight = isIPhoneX() ? 79 : 50;
