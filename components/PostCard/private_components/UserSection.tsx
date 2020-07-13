import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import { FontAwesome5 } from '../../../constants';
import { convertTime } from '../../../utils/functions';

interface UserSectionProps {
  avatar: string;
  username: string;
  datePosted: number;
  iconPrivacy: string;
  navigateWhenClickOnPostOrComment: () => void;
  navigateWhenClickOnUsernameOrAvatar?: () => void;
}

export default function UserSection({
  avatar,
  username,
  datePosted,
  iconPrivacy,
  navigateWhenClickOnUsernameOrAvatar = undefined,
  navigateWhenClickOnPostOrComment,
}: UserSectionProps) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  userWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    marginLeft: 12,
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
});
