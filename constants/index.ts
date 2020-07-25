import { getSystemName, hasNotch } from 'react-native-device-info';

import Colors from './Colors';
import Layout from './Layout';

export const oneWeek = 6.048e8;
export const oneMonth = 2.628e9;
export const oneYear = 3.154e10;

export const tokenForTag = '\u200B';
// export const tokenForTag = '\u01AA';
export const separatorForTag = '\u01B1';

export const pendingPostID = 'pending-post-69';
export const pendingDeletePostFlag = '--pending-delete-post';
export const pendingCommentID = 'pending-comment-69';
export const pendingDeleteCommentFlag = '--pending-delete-comment';

const deviceOS = getSystemName();
export const bottomTabHeight =
  deviceOS === 'iOS' || deviceOS === 'iPhone OS' ? (hasNotch() ? 79 : 50) : 50;

export { Colors, Layout };
export * from './Icons';
