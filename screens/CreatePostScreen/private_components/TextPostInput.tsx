import React, { useRef } from 'react';
import { TextInput, View, Text, ScrollView, StyleSheet } from 'react-native';
import { Layout, Colors } from '../../../constants';

export default React.memo(
  function TextPostInput({
    value,
    onChangeText,
    onSelectionChange,
    onDeleteHandle,
    taggedUsers,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    onSelectionChange: ({ nativeEvent }: any) => void;
    onDeleteHandle: () => void;
    taggedUsers: Array<string>;
  }) {
    const scrollViewRef: React.MutableRefObject<
      ScrollView | undefined
    > = useRef();

    const syncScrollOffset = ({ nativeEvent }: any) => {
      if (scrollViewRef && scrollViewRef.current) {
        scrollViewRef!.current!.scrollTo({
          y: nativeEvent.contentOffset.y,
          animated: false,
        });
      }
    };

    const onKeyPress = ({ nativeEvent }: any) => {
      if (nativeEvent.key === 'Backspace') {
        onDeleteHandle();
      }
    };

    const checkIfChunkIsTagOrText = (str: string) => {
      for (const tag of taggedUsers) {
        if (str === tag || str.includes(tag)) {
          return true;
        }
      }
      return false;
    };

    const splitted = value.split(/(?=\n)| /);
    const textChunks = splitted.map((str) => {
      if (checkIfChunkIsTagOrText(str)) {
        return {
          type: 'tag',
          value: str,
        };
      }
      return {
        type: 'text',
        value: str,
      };
    });

    return (
      <View>
        <TextInput
          style={styles.hiddenTextInput}
          value={value}
          onKeyPress={onKeyPress}
          onChangeText={onChangeText}
          onScroll={syncScrollOffset}
          onSelectionChange={onSelectionChange}
          placeholder="Your text post"
          placeholderTextColor="#a6a9b4"
          autoCorrect={false}
          multiline
        />
        <ScrollView
          ref={scrollViewRef as React.MutableRefObject<ScrollView>}
          style={styles.textScrollView}>
          <Text style={{ color: 'white', paddingTop: 0 }}>
            {textChunks.map((val, i) => {
              if (val.type === 'text') {
                return <Text key={i}>{val.value} </Text>;
              }
              return (
                <Text key={i} style={{ color: Colors.userTag }}>
                  {val.value}{' '}
                </Text>
              );
            })}
          </Text>
        </ScrollView>
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.value !== nextProps.value) {
      return false;
    }
    return true;
  },
);

const styles = StyleSheet.create({
  hiddenTextInput: {
    width: '100%',
    height: Layout.window.height / 4,
    color: 'rgba(255, 255, 255, 0)',
    marginTop: 12,
    paddingTop: 0,
    zIndex: 100,
  },
  textScrollView: {
    width: '100%',
    position: 'absolute',
    top: 12,
    height: Layout.window.height / 4,
  },
});
