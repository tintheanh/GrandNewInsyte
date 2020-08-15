import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import {
  Colors,
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '../../../constants';
import { Carousel, Avatar } from '../../../components';
import {
  convertNumber,
  generateCaptionWithTagsAndUrls,
  openURL,
} from '../../../utils/functions';
import { Post } from '../../../models';

interface PostSectionProps {
  post: Post;
  shouldPlayMedia: boolean;

  /**
   * Method navigate to user screen
   */
  navigateWhenPressOnUsernameOrAvatar: () => void;

  /**
   * Method navigate when pressing on user's tag
   * @param user Preloaded user passed to new screen
   */
  navigateWhenPressOnTag?: (user: {
    id: string;
    username: string;
    avatar: string;
  }) => () => void;

  likePost: () => void;
  unLikePost: () => void;

  /**
   * Method perform delete post, only posts that belong to the current
   * user can be deleted
   */
  userControl?: () => void;
}

export default React.memo(
  function PostSection({
    post,
    shouldPlayMedia,
    navigateWhenPressOnUsernameOrAvatar,
    navigateWhenPressOnTag,
    userControl,
    likePost,
    unLikePost,
  }: PostSectionProps) {
    const {
      user,
      timeLabel,
      privacy,
      caption,
      isLiked,
      media,
      likes,
      comments,
    } = post;
    let iconPrivacy = '';
    switch (privacy) {
      case 'public':
        iconPrivacy = 'globe';
        break;
      case 'followers':
        iconPrivacy = 'users';
        break;
      default:
        iconPrivacy = 'lock';
        break;
    }

    return (
      <View style={{ backgroundColor: Colors.darkColor, paddingBottom: 12 }}>
        <View style={styles.userWrapper}>
          <Avatar
            avatar={user.avatar}
            onPress={navigateWhenPressOnUsernameOrAvatar}
          />
          <View style={styles.usernameAndTimeWrapper}>
            <TouchableWithoutFeedback
              onPress={navigateWhenPressOnUsernameOrAvatar}>
              <Text style={styles.username}>{user.username}</Text>
            </TouchableWithoutFeedback>
            <View style={styles.timeAndPrivacyWrapper}>
              <Text style={styles.time}>{timeLabel}</Text>
              <FontAwesome5
                name={iconPrivacy}
                size={9}
                color="white"
                style={{ marginTop: 1 }}
              />
            </View>
          </View>
          {userControl ? (
            <View style={styles.userControlWrapper}>
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
        <Text style={styles.caption}>
          {generateCaptionWithTagsAndUrls(caption).map((element, i) => {
            if (element.type === 'tag') {
              const textChunk = element as {
                value: { text: string; uid: string; username: string };
              };
              return (
                <Text
                  key={i}
                  style={{ color: Colors.userTag }}
                  onPress={
                    navigateWhenPressOnTag
                      ? navigateWhenPressOnTag({
                          id: textChunk.value.uid,
                          username: textChunk.value.username,
                          avatar: '',
                        })
                      : undefined
                  }>
                  {textChunk.value.text}{' '}
                </Text>
              );
            }
            if (element.type === 'url') {
              const textChunk = element as {
                value: string;
              };
              return (
                <Text
                  key={i}
                  style={{ color: Colors.tintColor }}
                  onPress={openURL(textChunk.value)}>
                  {textChunk.value}
                </Text>
              );
            }
            return <Text key={i}>{element.value} </Text>;
          })}
        </Text>
        {media.length ? (
          <Carousel items={media} shouldPlayMedia={shouldPlayMedia} />
        ) : null}
        <View style={styles.interactionSection}>
          <View style={styles.likeAndComment}>
            <TouchableWithoutFeedback onPress={isLiked ? unLikePost : likePost}>
              <View style={styles.iconWrapper}>
                <AntDesign
                  name="like1"
                  size={18}
                  color={isLiked ? Colors.tintColor : 'white'}
                />
                <Text
                  style={[
                    styles.interactionText,
                    { color: isLiked ? Colors.tintColor : 'white' },
                  ]}>
                  {convertNumber(likes)}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="mode-comment" size={18} color="white" />
              <Text style={styles.interactionText}>
                {convertNumber(comments)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.shouldPlayMedia !== nextProps.shouldPlayMedia) {
      return false;
    }
    if (prevProps.post.likes !== nextProps.post.likes) {
      return false;
    }
    if (prevProps.post.comments !== nextProps.post.comments) {
      return false;
    }
    return true;
  },
);

const styles = StyleSheet.create({
  userWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
    paddingLeft: 10,
    paddingRight: 10,
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
    fontSize: 15,
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
  userControlWrapper: {
    marginTop: -5,
    alignSelf: 'stretch',
    flexGrow: 1,
  },
  caption: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: 4,
    color: 'white',
    fontSize: 14,
  },
  interactionSection: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
  iconWrapper: {
    flexDirection: 'row',
  },
  likeAndComment: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interactionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 2,
  },
});
