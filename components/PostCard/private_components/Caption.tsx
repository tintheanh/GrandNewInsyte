import React from 'react';
import { TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants';
import {
  wrapPostCaption,
  generateCaptionTextArray,
  openURL,
} from '../../../utils/functions';

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
      {caption.length <= 200 ? (
        <Text style={styles.caption}>
          {generateCaptionTextArray(caption).map((text, i) => {
            if (text.type === 'url') {
              return (
                <Text
                  key={i}
                  style={{ color: Colors.tintColor }}
                  onPress={openURL(text.value)}>
                  {text.value}
                </Text>
              );
            }
            return <Text key={i}>{text.value}</Text>;
          })}
        </Text>
      ) : (
        <Text style={styles.caption}>
          {generateCaptionTextArray(wrapPostCaption(caption)).map((text, i) => {
            if (text.type === 'url') {
              return (
                <Text key={i} style={{ color: Colors.tintColor }}>
                  {text.value}
                </Text>
              );
            }
            return <Text key={i}>{text.value}</Text>;
          })}{' '}
          <Text style={{ fontWeight: '500' }}>... See more</Text>
        </Text>
      )}
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
