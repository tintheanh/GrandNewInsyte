import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5, Entypo } from '../../../constants';
import { convertTime } from '../../../utils/functions';

interface UserSectionProps {
  postID: string;
  avatar: string;
  username: string;
  datePosted: number;
  iconPrivacy: string;
  navigateWhenClickOnPostOrComment: () => void;
  navigateWhenClickOnUsernameOrAvatar?: () => void;
  userPostControl?: () => void;
}

export default function UserSection({
  postID,
  avatar,
  username,
  datePosted,
  iconPrivacy,
  navigateWhenClickOnUsernameOrAvatar = undefined,
  navigateWhenClickOnPostOrComment,
  userPostControl = undefined,
}: UserSectionProps) {
  // console.log(postID);
  return (
    <View style={styles.userWrapper}>
      <TouchableWithoutFeedback onPress={navigateWhenClickOnUsernameOrAvatar}>
        <Image
          style={styles.avatar}
          source={
            avatar ? { uri: avatar } : require('../../../assets/user.png')
          }
          defaultSource={require('../../../assets/user.png')}
        />
      </TouchableWithoutFeedback>
      <View style={styles.usernameAndTimeWrapper}>
        <TouchableWithoutFeedback onPress={navigateWhenClickOnUsernameOrAvatar}>
          <Text style={styles.username}>{username}</Text>
        </TouchableWithoutFeedback>
        <View style={styles.timeAndPrivacyWrapper}>
          <Text style={styles.time}>{convertTime(datePosted)}</Text>
          <FontAwesome5
            name={iconPrivacy}
            size={9}
            color="white"
            style={{ marginTop: 1 }}
          />
        </View>
      </View>
      {/* remaining space for pressing */}
      <TouchableWithoutFeedback onPress={navigateWhenClickOnPostOrComment}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>
      {postID === 'pending-post-69' ||
      postID.includes('--pending-delete-post') ? (
        <View>
          <ActivityIndicator size="small" color="white" />
        </View>
      ) : userPostControl ? (
        <TouchableWithoutFeedback onPress={userPostControl}>
          <Entypo
            name="chevron-down"
            size={20}
            color="rgba(255,255,255, 0.6)"
            style={styles.iconDown}
          />
        </TouchableWithoutFeedback>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  userWrapper: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 12,
    paddingRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
  },
  usernameAndTimeWrapper: {
    flexDirection: 'column',
    marginLeft: 6,
    marginTop: -3,
  },
  username: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  timeAndPrivacyWrapper: {
    flexDirection: 'row',
  },
  time: {
    color: 'white',
    fontSize: 10,
    marginRight: 4,
  },
  iconDown: {
    marginTop: -5,
  },
});
