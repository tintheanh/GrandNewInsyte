import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { AntDesign } from '../../../constants';
import { convertNumber } from '../../../utils/functions';

interface InteractionSectionProps {
  likes: number;
}

export default function InteractionSection({ likes }: InteractionSectionProps) {
  return (
    <View style={styles.interactionSection}>
      <View style={styles.iconWrapper}>
        <AntDesign
          name="like2"
          size={14}
          color="white"
          style={{ marginTop: -3, marginRight: 3 }}
        />
        <Text style={styles.interactionText}>
          {likes > 0 ? convertNumber(likes) : ''}
        </Text>
      </View>
      <TouchableWithoutFeedback onPress={() => console.log('to reply')}>
        <Text style={styles.interactionText}>reply</Text>
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
    color: 'white',
    fontSize: 10,
    marginRight: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  iconWrapper: {
    flexDirection: 'row',
  },
});
