import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Avatar from './Avatar';
import {
  Colors,
  Layout,
  AntDesign,
  MaterialCommunityIcons,
  pendingReplyID,
  pendingDeleteReplyFlag,
} from '../constants';
import { convertTime, convertNumber } from '../utils/functions';

interface ReplyCardProps {
  id: string;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
  isLiked: boolean;
  content: string;
  datePosted: number;
  likes: number;
  likeReply: () => void;
  unlikeReply: () => void;
  userControl?: () => void;
}

export default React.memo(
  function ReplyCard(props: ReplyCardProps) {
    // const navigation = useNavigation<any>();

    const {
      id,
      user,
      content,
      userControl,
      likeReply,
      unlikeReply,
      datePosted,
      likes,
      isLiked,
    } = props;

    // const toReplyScreen = () =>
    //   navigation.push('ReplyScreen', {
    //     comment: {
    //       id,
    //       user,
    //       content,
    //       datePosted,
    //       replies,
    //       likes,
    //       isLiked,
    //     },
    //   });

    return (
      <View
        style={[
          styles.container,
          {
            opacity:
              id === pendingReplyID || id.includes(pendingDeleteReplyFlag)
                ? 0.4
                : 1,
          },
        ]}>
        <View style={styles.innerContainer}>
          <Avatar
            avatar={user.avatar}
            onPress={() => console.log('to user screen')}
          />
          <View style={{ marginLeft: 12, flexShrink: 1 }}>
            <View style={{ flexShrink: 1 }}>
              <View style={{ flexDirection: 'row' }}>
                <TouchableWithoutFeedback
                  onPress={() => console.log('to user profile')}>
                  <Text style={styles.username}>{user.username}</Text>
                </TouchableWithoutFeedback>
                <Text style={styles.date}>{convertTime(datePosted)}</Text>
                {userControl ? (
                  <View style={{ flexGrow: 1 }}>
                    <TouchableWithoutFeedback onPress={userControl}>
                      <MaterialCommunityIcons
                        name="dots-horizontal"
                        size={20}
                        color="rgba(255,255,255, 0.6)"
                        style={{ alignSelf: 'flex-end' }}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                ) : null}
              </View>
              <Text style={styles.content}>{content}</Text>
            </View>
            <View style={{ paddingTop: 8 }}>
              <TouchableWithoutFeedback
                onPress={isLiked ? unlikeReply : likeReply}>
                <View style={styles.iconWrapper}>
                  <AntDesign
                    name="like1"
                    size={14}
                    color={isLiked ? Colors.tintColor : 'white'}
                    style={{ marginTop: -3, marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.interactionText,
                      { color: isLiked ? Colors.tintColor : 'white' },
                    ]}>
                    {likes > 0 ? convertNumber(likes) : ' '}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.likes !== nextProps.likes) {
      return false;
    }
    return true;
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    backgroundColor: Colors.darkColor,
  },
  innerContainer: {
    flexDirection: 'row',
    width: Layout.window.width - 40 - 14,
    alignSelf: 'flex-end',
    paddingLeft: 14,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
  },
  date: {
    color: '#82858F',
    marginLeft: 8,
    marginTop: 1,
    fontSize: 12,
  },
  content: {
    color: 'white',
    width: Layout.window.width - 40 - 14 - 20,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingRight: 56,
  },
  iconWrapper: {
    flexDirection: 'row',
  },
  interactionText: {
    fontSize: 10,
    marginRight: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
