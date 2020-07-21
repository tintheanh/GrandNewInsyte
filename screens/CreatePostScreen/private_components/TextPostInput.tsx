import React, { useRef } from 'react';
import { TextInput, View, Text, ScrollView } from 'react-native';
import { Layout } from '../../../constants';

export default React.memo(
  function TextPostInput({
    value,
    onChangeText,
    onSelectionChange,
    onDeleteHandle,
    userTags,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    onSelectionChange: (event: any) => void;
    onDeleteHandle: () => void;
    userTags: Array<string>;
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

    const checkTasInCurrentTags = (str: string) => {
      for (const tag of userTags) {
        if (str === tag || str.includes(tag)) {
          return true;
        }
      }
      return false;
    };

    const splitted = value.split(/(?=\n)| /);
    const textChunks = splitted.map((str) => {
      if (checkTasInCurrentTags(str)) {
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

    // console.log(textChunks);

    return (
      <View>
        <TextInput
          style={{
            width: '100%',
            height: Layout.window.height / 4,
            color: 'rgba(255, 255, 255, 0)',
            marginTop: 12,
            zIndex: 100,
          }}
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
          style={{
            width: '100%',
            position: 'absolute',
            top: 17,
            height: Layout.window.height / 4,
          }}>
          <Text style={{ color: 'white' }}>
            {/* {value.replace(/token/g, '')} */}
            {/* {value} */}
            {textChunks.map((val, i) => {
              if (val.type === 'text') {
                return <Text key={i}>{val.value} </Text>;
              }
              return (
                <Text key={i} style={{ color: '#7ABDED' }}>
                  {val.value}{' '}
                </Text>
              );
            })}
          </Text>
        </ScrollView>
        {/* <TextInput
          style={{ height: 0, opacity: 0 }}
          value={value}
          onChangeText={onChangeText}
          onSelectionChange={onSelectionChange}
          autoCorrect={false}
          multiline
          editable={false}
        /> */}
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
