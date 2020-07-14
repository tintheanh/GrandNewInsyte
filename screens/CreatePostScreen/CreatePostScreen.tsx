import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { filterImageArray, alertDialog } from '../../utils/functions';
import ImagePicker, { Image } from 'react-native-image-crop-picker';
import {
  PrivacySelection,
  LocationSelection,
  TextPostInput,
  MediaInput,
  MediaView,
} from './private_components';
import { Colors } from '../../constants';

// const DismissKeyboard = ({ children }: any): JSX.Element => (
//   <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
//     {children}
//   </TouchableWithoutFeedback>
// );

interface CreatePostScreenState {
  privacy: 'public' | 'followers';
  caption: string;
  media: Array<{
    uri: string;
    mime: string;
    size: number;
    width: number;
    height: number;
  }>;
}

class CreatePostScreen extends Component<any, CreatePostScreenState> {
  state = {
    privacy: 'public' as 'public',
    caption: '',
    media: [],
  };

  setPrivacy = () => {
    Alert.alert(
      '',
      'Select who can see your post',
      [
        {
          text: 'Public',
          onPress: () => this.setState({ privacy: 'public' }),
        },
        {
          text: 'Followers',
          onPress: () => this.setState({ privacy: 'followers' }),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  setCaption = (text: string) => this.setState({ caption: text });

  onGoback = () => {
    Alert.alert(
      '',
      'All unsaved changes will be discarded',
      [
        {
          text: 'Discard',
          onPress: () => this.props.navigation.goBack(),
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  pickMedia = async () => {
    try {
      const media = (await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'any',
        maxFiles: 10,
        includeExif: true,
      })) as Image[];

      const mediaItems = media.map((md) => ({
        uri: md.path,
        mime: md.mime,
        size: md.size,
        width: md.width,
        height: md.height,
      }));

      const newMedia = (this.state.media as any[]).concat(mediaItems);
      const filtered = filterImageArray(newMedia);

      this.setState({ media: filtered });
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        alertDialog('Error occured. Please try again!');
      }
    }
  };

  removeMedia = (index: number) => {
    console.log(index);
    const currentMedia = [...this.state.media];
    currentMedia.splice(index, 1);
    this.setState({ media: currentMedia });
  };

  openPhotoCamera = async () => {
    try {
      const image = (await ImagePicker.openCamera({
        mediaType: 'photo',
      })) as Image;
      const newMedia: any[] = [...this.state.media];
      newMedia.push({
        uri: image.path,
        mime: image.mime,
        size: image.size,
        width: image.width,
        height: image.height,
      });
      this.setState({ media: newMedia });
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        alertDialog('Error occured. Please try again!');
      }
    }
  };

  openVideoCamera = async () => {
    try {
      const video = (await ImagePicker.openCamera({
        mediaType: 'video',
      })) as Image;

      const newMedia: any[] = [...this.state.media];
      newMedia.push({
        uri: video.path,
        mime: video.mime,
        size: video.size,
        width: video.width,
        height: video.height,
      });
      this.setState({ media: newMedia });
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        alertDialog('Error occured. Please try again!');
      }
    }
  };

  performSubmitPost = () => {
    const { caption, media } = this.state;
    if (caption === '' && media.length === 0) {
      return alertDialog('Your post cannot be empty.');
    }
    console.log('ok');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.btnWrapper}>
            <TouchableOpacity
              style={{ alignSelf: 'flex-start' }}
              onPress={this.onGoback}>
              <Text
                style={{
                  color: 'white',
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignSelf: 'flex-start' }}
              onPress={this.performSubmitPost}>
              <Text
                style={{
                  color: 'white',
                }}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.createPostText}>Create post</Text>
          <PrivacySelection
            label={this.state.privacy}
            onSetPrivacy={this.setPrivacy}
          />
          <LocationSelection />
          <TextPostInput
            value={this.state.caption}
            onChangeText={this.setCaption}
          />
          <MediaInput
            onOpenPhotoLibrary={this.pickMedia}
            onOpenPhotoCamera={this.openPhotoCamera}
            onOpenVideoCamera={this.openVideoCamera}
          />
          {this.state.media.length > 0 ? (
            <MediaView media={this.state.media} onRemove={this.removeMedia} />
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkColor,
  },
  wrapper: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 22,
    paddingRight: 22,
  },
  btnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createPostText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CreatePostScreen;
