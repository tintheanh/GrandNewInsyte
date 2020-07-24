import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { AntDesign, Colors } from '../../../constants';
import { convertNumber } from '../../../utils/functions';

interface InteractionSectionProps {
  likes: number;
  isLiked: boolean;
  likeComment: () => void;
  unlikeComment: () => void;
}

export default function InteractionSection({
  likes,
  isLiked,
  likeComment,
  unlikeComment,
}: InteractionSectionProps) {
  return (
    <View style={styles.interactionSection}>
      <TouchableWithoutFeedback onPress={isLiked ? unlikeComment : likeComment}>
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
      <TouchableWithoutFeedback onPress={() => console.log('to reply')}>
        <Text style={[styles.interactionText, { color: 'white' }]}>reply</Text>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  interactionSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  interactionText: {
    fontSize: 10,
    marginRight: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  iconWrapper: {
    flexDirection: 'row',
  },
});
