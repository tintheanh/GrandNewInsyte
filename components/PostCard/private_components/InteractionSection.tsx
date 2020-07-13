import React from 'react';
import { View, TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { AntDesign, FontAwesome, Feather } from '../../../constants';
import { convertNumber } from '../../../utils/functions';

interface InteractionSectionProps {
  likes: number;
  comments: number;
  navigateWhenClickOnPostOrComment: () => void;
}

export default function InteractionSection({
  likes,
  comments,
  navigateWhenClickOnPostOrComment,
}: InteractionSectionProps) {
  return (
    <View style={styles.interactionSection}>
      <View style={styles.likeAndComment}>
        <View style={styles.iconWrapper}>
          <AntDesign name="like2" size={18} color="white" />
          <Text style={styles.interactionText}>{convertNumber(likes)}</Text>
        </View>
        <TouchableWithoutFeedback onPress={navigateWhenClickOnPostOrComment}>
          <View style={styles.iconWrapper}>
            <FontAwesome name="comment-o" size={18} color="white" />
            <Text style={styles.interactionText}>
              {convertNumber(comments)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.share}>
        <View style={styles.iconWrapper}>
          <Feather name="share" size={18} color="white" />
          <Text style={styles.interactionText}>Share</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
