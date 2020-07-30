import React from 'react';
import { View, TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { Colors, AntDesign, Feather, MaterialIcons } from '../../../constants';
import { convertNumber } from '../../../utils/functions';

interface InteractionSectionProps {
  isLiked: boolean;
  likes: number;
  comments: number;
  navigateWhenClickOnPostOrComment?: () => void;
  performLikePost: () => void;
  performUnlikePost: () => void;
}

export default function InteractionSection({
  isLiked,
  likes,
  comments,
  navigateWhenClickOnPostOrComment,
  performLikePost,
  performUnlikePost,
}: InteractionSectionProps) {
  return (
    <View style={styles.interactionSection}>
      <View style={styles.likeAndComment}>
        <TouchableWithoutFeedback
          onPress={isLiked ? performUnlikePost : performLikePost}>
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
        <TouchableWithoutFeedback onPress={navigateWhenClickOnPostOrComment}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="mode-comment" size={18} color="white" />
            <Text style={styles.interactionText}>
              {convertNumber(comments)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  interactionSection: {
    flexDirection: 'row',
    width: '40%',
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
  interactionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 2,
  },
});
