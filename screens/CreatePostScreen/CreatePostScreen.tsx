import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import { filterImageArray, alertDialog } from '../../utils/functions';
import ImagePicker, { Image } from 'react-native-image-crop-picker';
import {
  PrivacySelection,
  LocationSelection,
  TextPostInput,
  MediaInput,
  MediaView,
  CreatePostUserResultList,
} from './private_components';
import { createPost } from '../../redux/posts/actions';
import { clear } from '../../redux/tag/actions';
import { Colors } from '../../constants';

// const DismissKeyboard = ({ children }: any): JSX.Element => (
//   <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
//     {children}
//   </TouchableWithoutFeedback>
// );

interface CreatePostScreenState {
  post: {
    privacy: 'public' | 'followers' | 'private';
    caption: string;
    media: Array<{
      uri: string;
      mime: string;
      size: number;
      width: number;
      height: number;
    }>;
  };
  selection: any;
  tagIndex: number;
  keyboardOffset: number;
  tagListPosition: number;
  tagQuery: string;
}

class CreatePostScreen extends Component<any, CreatePostScreenState> {
  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;

  state: CreatePostScreenState = {
    post: {
      privacy: 'public' as 'public',
      caption: '',
      media: [],
    },
    selection: null,
    tagIndex: -1,
    keyboardOffset: 0,
    tagListPosition: 0,
    tagQuery: '',
  };

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow = (event: any) => {
    this.setState({
      keyboardOffset: event.endCoordinates.screenY,
    });
  };

  _keyboardDidHide = () => {
    this.setState({
      keyboardOffset: 0,
      tagIndex: -1,
    });
  };

  setPrivacy = () => {
    Alert.alert(
      '',
      'Select who can see your post',
      [
        {
          text: 'Public',
          onPress: () => {
            const newState = { ...this.state };
            newState.post.privacy = 'public';
            this.setState(newState);
          },
        },
        {
          text: 'Followers',
          onPress: () => {
            const newState = { ...this.state };
            newState.post.privacy = 'followers';
            this.setState(newState);
          },
        },
        {
          text: 'Private',
          onPress: () => {
            const newState = { ...this.state };
            newState.post.privacy = 'private';
            this.setState(newState);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  setCaption = async (text: string) => {
    // set user search query when tagging is activated
    if (this.state.tagIndex !== -1) {
      const newState2 = { ...this.state };
      newState2.tagQuery = text.slice(
        this.state.tagIndex,
        this.state.selection.start,
      );
      newState2.post.caption = text;
      await this.setState(newState2);
      // console.log('out', this.state.tagQuery);
    }
    const newState = { ...this.state };
    const { start } = this.state.selection;
    newState.post.caption = text;
    this.setState(newState, () => {
      const newly = this.getNewlyEnteredLetters();

      if (newly === '@' && (start === text.length || text[start] === ' ')) {
        // activate tagging
        const newState2 = { ...this.state };
        newState2.tagIndex = start;
        this.setState(newState2);
      } else if (
        newly === ' ' ||
        (this.state.tagIndex !== -1 &&
          (text.slice(this.state.tagIndex, start).includes(' ') ||
            start < this.state.tagIndex))
      ) {
        // deactivate tagging
        this.props.onClearTag();
        const newState2 = { ...this.state };
        newState2.tagIndex = -1;
        this.setState(newState2);
      }
    });
  };

  handleCaptionSelectionChange = (event: any) => {
    const newState = { ...this.state };
    const { selection } = event.nativeEvent;
    newState.selection = selection;
    this.setState(newState);
  };

  getNewlyEnteredLetters = (): string => {
    const { selection } = this.state;
    const { caption } = this.state.post;
    if (selection === null) {
      return caption[caption.length - 1];
    }
    const { start, end } = selection;
    return start === end ? caption[start - 1] : caption[caption.length - 1];
  };

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
      })) as Image[];

      const mediaItems = media.map((md) => ({
        uri: md.path,
        mime: md.mime,
        size: md.size,
        width: md.width,
        height: md.height,
      }));

      const newState = { ...this.state };

      const currentMedia = [...this.state.post.media];

      const newMedia = currentMedia.concat(mediaItems);
      const filteredMedia = filterImageArray(newMedia);
      newState.post.media = filteredMedia;

      this.setState(newState);
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        alertDialog('Error occured. Please try again!');
      }
    }
  };

  removeMedia = (index: number) => {
    const newState = { ...this.state };
    const currentMedia = [...this.state.post.media];
    currentMedia.splice(index, 1);
    newState.post.media = currentMedia;
    this.setState(newState);
  };

  openPhotoCamera = async () => {
    try {
      const image = (await ImagePicker.openCamera({
        mediaType: 'photo',
      })) as Image;
      const newState = { ...this.state };
      const currentMedia = [...this.state.post.media];
      currentMedia.push({
        uri: image.path,
        mime: image.mime,
        size: image.size,
        width: image.width,
        height: image.height,
      });
      newState.post.media = currentMedia;
      this.setState(newState);
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

      const newState = { ...this.state };
      const currentMedia = [...this.state.post.media];
      currentMedia.push({
        uri: video.path,
        mime: video.mime,
        size: video.size,
        width: video.width,
        height: video.height,
      });
      newState.post.media = currentMedia;
      this.setState(newState);
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        alertDialog('Error occured. Please try again!');
      }
    }
  };

  performSubmitPost = () => {
    const { post } = this.state;
    if (post.caption === '' && post.media.length === 0) {
      return alertDialog('Your post cannot be empty.');
    }
    this.props.onCreatePost(post, this.props.navigation.goBack);
  };

  render() {
    const { post } = this.state;
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
            label={post.privacy}
            onSetPrivacy={this.setPrivacy}
          />
          <LocationSelection />
          <TextPostInput
            value={post.caption}
            onChangeText={this.setCaption}
            onSelectionChange={this.handleCaptionSelectionChange}
          />
          {this.state.tagIndex !== -1 ? (
            <View
              style={{
                height: this.state.keyboardOffset - this.state.tagListPosition,
              }}
              onLayout={({ nativeEvent }) =>
                this.setState({ tagListPosition: nativeEvent.layout.y })
              }>
              <CreatePostUserResultList tagQuery={this.state.tagQuery} />
            </View>
          ) : (
            <View>
              <MediaInput
                onOpenPhotoLibrary={this.pickMedia}
                onOpenPhotoCamera={this.openPhotoCamera}
                onOpenVideoCamera={this.openVideoCamera}
              />
              {post.media.length > 0 ? (
                <MediaView media={post.media} onRemove={this.removeMedia} />
              ) : null}
            </View>
          )}
        </View>
      </View>
    );
  }
}

const mapDisPatchToProps = {
  onCreatePost: createPost,
  onClearTag: clear,
};

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

export default connect(null, mapDisPatchToProps)(CreatePostScreen);
