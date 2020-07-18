import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '../../../constants';
import { Layout } from '../../../constants';

const thumbWidth = Layout.window.width / 4;

const checkMediaChanged = (
  mediaList1: Array<{ uri: string; mime: string }>,
  mediaList2: Array<{ uri: string; mime: string }>,
) => {
  if (mediaList1.length !== mediaList2.length) {
    return true;
  }

  const len = mediaList1.length;
  for (let i = 0; i < len; i++) {
    const media1 = mediaList1[i];
    const media2 = mediaList2[i];
    if (media1.uri !== media2.uri || media1.mime !== media2.mime) {
      return true;
    }
  }
  return false;
};

export default React.memo(
  function MediaView({
    media,
    onRemove,
  }: {
    media: Array<{ uri: string; mime: string }>;
    onRemove: (index: number) => void;
  }) {
    return (
      <SafeAreaView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {media.map((md, i) => {
            if (md.mime.includes('image')) {
              return (
                <View key={i} style={styles.mediaWrapper}>
                  <TouchableWithoutFeedback onPress={() => onRemove(i)}>
                    <View style={styles.iconWrapper}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={22}
                        color="black"
                      />
                    </View>
                  </TouchableWithoutFeedback>
                  <View style={styles.shadow}>
                    <Image source={{ uri: md.uri }} style={styles.mediaStyle} />
                  </View>
                </View>
              );
            }
            return (
              <View key={i} style={styles.mediaWrapper}>
                <TouchableWithoutFeedback onPress={() => onRemove(i)}>
                  <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={22}
                      color="black"
                    />
                  </View>
                </TouchableWithoutFeedback>
                <View style={styles.shadow}>
                  <Video
                    key={i}
                    source={{ uri: md.uri }}
                    shouldPlay={false}
                    style={{ ...styles.mediaStyle, backgroundColor: 'black' }}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  },
  (prevProps, nextProps) => {
    if (checkMediaChanged(prevProps.media, nextProps.media)) {
      return false;
    }
    return true;
  },
);

const styles = StyleSheet.create({
  scrollStyle: {
    flex: 1,
  },
  mediaWrapper: {
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 14,
  },
  mediaStyle: {
    width: thumbWidth,
    height: thumbWidth,
    borderRadius: 4,
  },
  iconWrapper: {
    borderRadius: 40,
    backgroundColor: 'white',
    position: 'absolute',
    right: -8,
    zIndex: 100,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
});
