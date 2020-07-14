import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import {
  AntDesign,
  FontAwesome,
  Feather,
  FontAwesome5,
} from '../../../constants';
import { Carousel } from '../../../components';
import { convertNumber, convertTime } from '../../../utils/functions';

interface PostSectionProps {
  avatar: string;
  username: string;
  datePosted: number;
  iconPrivacy: string;
  caption: string;
  media: Array<{
    url: string;
    type: string;
  }>;
  likes: number;
  comments: number;
  navigateWhenClickOnUsernameOrAvatar?: () => void;
  selectCommentFilter: () => void;
}

export default function PostSection({
  avatar,
  username,
  datePosted,
  iconPrivacy,
  caption,
  media,
  likes,
  comments,
  navigateWhenClickOnUsernameOrAvatar = undefined,
  selectCommentFilter,
}: PostSectionProps) {
  return (
    <View>
      <View style={styles.userWrapper}>
        <TouchableWithoutFeedback onPress={navigateWhenClickOnUsernameOrAvatar}>
          <Image
            style={styles.avatar}
            source={{ uri: avatar }}
            defaultSource={require('../../../assets/user.png')}
          />
        </TouchableWithoutFeedback>
        <View style={styles.usernameAndTimeWrapper}>
          <TouchableWithoutFeedback
            onPress={navigateWhenClickOnUsernameOrAvatar}>
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
      </View>
      <Text style={styles.caption}>{caption}</Text>
      {media.length ? <Carousel items={media} shouldPlayMedia /> : null}
      <View style={styles.interactionSection}>
        <View style={styles.likeAndComment}>
          <View style={styles.iconWrapper}>
            <AntDesign name="like2" size={18} color="white" />
            <Text style={styles.interactionText}>{convertNumber(likes)}</Text>
          </View>
          <View style={styles.iconWrapper}>
            <FontAwesome name="comment-o" size={18} color="white" />
            <Text style={styles.interactionText}>
              {convertNumber(comments)}
            </Text>
          </View>
        </View>
        <View style={styles.share}>
          <View style={styles.iconWrapper}>
            <Feather name="share" size={18} color="white" />
            <Text style={styles.interactionText}>Share</Text>
          </View>
        </View>
      </View>
      {/* TODO fix it expands width 100% */}
      <TouchableWithoutFeedback onPress={selectCommentFilter}>
        <View style={styles.filterComment}>
          <Text style={styles.filterCommentText}>Top comments </Text>
          <AntDesign name="caretdown" size={11} color="white" />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
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
  caption: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: 4,
    color: 'white',
    fontSize: 14,
  },
  interactionSection: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
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
  share: {
    flex: 2,
    alignItems: 'flex-end',
  },
  interactionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 2,
  },
  filterComment: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 16,
    marginLeft: 16,
    alignSelf: 'flex-start',
  },
  filterCommentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
