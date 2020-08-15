import React from 'react';
import { TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants';
import {
  wrapPostCaption,
  generateCaptionWithTagsAndUrls,
  openURL,
} from '../../../utils/functions';

interface CaptionProps {
  caption: string;
  navigateWhenPressOnPostOrComment?: () => void;
  navigateWhenPressOnTag?: (user: {
    id: string;
    username: string;
    avatar: string;
  }) => () => void;
}

export default function Caption({
  caption,
  navigateWhenPressOnPostOrComment,
  navigateWhenPressOnTag,
}: CaptionProps) {
  return (
    <TouchableWithoutFeedback onPress={navigateWhenPressOnPostOrComment}>
      {caption.length <= 200 ? (
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
      ) : (
        <Text style={styles.caption}>
          {generateCaptionWithTagsAndUrls(wrapPostCaption(caption)).map(
            (element, i) => {
              if (element.type === 'tag') {
                const textChunk = element as {
                  value: { text: string; uid: string };
                };
                return (
                  <Text key={i} style={{ color: Colors.userTag }}>
                    {textChunk.value.text}{' '}
                  </Text>
                );
              }
              if (element.type === 'url') {
                const textChunk = element as {
                  value: string;
                };
                return (
                  <Text key={i} style={{ color: Colors.tintColor }}>
                    {textChunk.value}
                  </Text>
                );
              }
              return <Text key={i}>{element.value} </Text>;
            },
          )}{' '}
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
