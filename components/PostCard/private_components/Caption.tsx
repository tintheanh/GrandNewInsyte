import React from 'react';
import { TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';

interface CaptionProps {
  caption: string;
  navigateWhenClickOnPostOrComment: () => void;
}

export default function Caption({
  caption,
  navigateWhenClickOnPostOrComment,
}: CaptionProps) {
  return (
    <TouchableWithoutFeedback onPress={navigateWhenClickOnPostOrComment}>
      <Text style={styles.caption}>{caption}</Text>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  caption: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: 4,
    color: 'white',
    fontSize: 14,
  },
});
