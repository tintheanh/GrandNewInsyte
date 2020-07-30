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
import { delay } from '../../utils/functions';
import { createPost } from '../../redux/posts/actions';
import { increaseTotalPostsByOne } from '../../redux/auth/actions';
import {
  clearButKeepSelected,
  setSelectedUserResults,
  clearAll,
} from '../../redux/tag/actions';
import { Colors, tokenForTag } from '../../constants';

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
    taggedUsers: Array<{ id: string; username: string }>;
  };
  currentTextInputSelection: { start: number; end: number } | null;
  cursorPositionWhenTagIsActivated: number;
  keyboardOffset: number;
  userResultListYCoordinate: number;
  searchQuery: string;
}

class CreatePostScreen extends Component<any, CreatePostScreenState> {
  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;

  state: CreatePostScreenState = {
    post: {
      privacy: 'public' as 'public',
      caption: '',
      media: [],
      taggedUsers: [],
    },
    currentTextInputSelection: null,
    cursorPositionWhenTagIsActivated: -1,
    keyboardOffset: 0,
    userResultListYCoordinate: 0,
    searchQuery: '',
  };

  /* ------------- get keyboard position stuff ------------ */

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
      cursorPositionWhenTagIsActivated: -1,
    });
  };

  /* ----------- end get keyboard position stuff ---------- */

  /* ---------------- TextInput helps stuff --------------- */

  handleCaptionSelectionChange = ({ nativeEvent }: any) => {
    const newState = { ...this.state };
    const { selection } = nativeEvent;
    newState.currentTextInputSelection = selection;
    this.setState(newState);
  };

  getNewlyEnteredLetters = (): string => {
    const { currentTextInputSelection } = this.state;
    const { caption } = this.state.post;
    if (currentTextInputSelection === null) {
      return caption[caption.length - 1];
    }
    const { start, end } = currentTextInputSelection;
    return start === end ? caption[start - 1] : caption[caption.length - 1];
  };

  /* -------------- end TextInput helps stuff ------------- */

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
    if (this.state.cursorPositionWhenTagIsActivated !== -1) {
      const newState = { ...this.state };
      const { cursorPositionWhenTagIsActivated } = this.state;
      const { start } = this.state.currentTextInputSelection!;
      newState.searchQuery = text.slice(
        cursorPositionWhenTagIsActivated,
        start,
      );
      newState.post.caption = text;
      await this.setState(newState);
    }
    const newState = { ...this.state };
    const { start } = this.state.currentTextInputSelection!;
    newState.post.caption = text;
    await this.setState(newState, () => {
      if (this.state.post.privacy === 'private') {
        return;
      }
      const newEnteredChar = this.getNewlyEnteredLetters();
      if (
        newEnteredChar === '@' &&
        (start === 1 || text[start - 2] === ' ' || text[start - 2] === '\n')
      ) {
        // activate tagging
        const innerNewState = { ...this.state };
        innerNewState.cursorPositionWhenTagIsActivated = start;
        this.setState(innerNewState);
      } else if (
        newEnteredChar === ' ' ||
        (this.state.cursorPositionWhenTagIsActivated !== -1 &&
          (text
            .slice(this.state.cursorPositionWhenTagIsActivated, start)
            .includes(' ') ||
            start < this.state.cursorPositionWhenTagIsActivated))
      ) {
        // deactivate tagging
        this.props.onClearButKeepSelected();
        const innerNewState = { ...this.state };
        innerNewState.cursorPositionWhenTagIsActivated = -1;
        this.setState(innerNewState);
      }
    });
  };

  tagUser = ({ id, username }: { id: string; username: string }) => {
    const newState = { ...this.state };
    const { start } = newState.currentTextInputSelection!;
    const taggedUsers = [...this.state.post.taggedUsers];
    const currentCaption = this.state.post.caption;

    // insert user result with token to current caption
    const newCaption =
      currentCaption.slice(0, start - this.state.searchQuery.length) +
      username +
      tokenForTag +
      ' ' +
      currentCaption.slice(start);

    newState.post.caption = newCaption;
    taggedUsers.push({ id, username: '@' + username + tokenForTag });
    const uids = taggedUsers.map((u) => u.id);

    newState.post.taggedUsers = taggedUsers;

    // clear search and deactivate tagging after done a tag
    newState.searchQuery = '';
    newState.cursorPositionWhenTagIsActivated = -1;

    this.props.onSetSelectedUserResults(uids);
    this.setState(newState);
  };

  onDeleteTaggedUser = async () => {
    const deleteIDs = await this.getDeletedUserTags();
    const newState = { ...this.state };
    const newUserTags = this.state.post.taggedUsers.filter(
      (user) => !deleteIDs.includes(user.id),
    );
    newState.post.taggedUsers = newUserTags;
    const uids = newUserTags.map((u) => u.id);
    this.props.onSetSelectedUserResults(uids);
    this.setState(newState);
  };

  getDeletedUserTags = async () => {
    // the only way is to delay because current caption
    // might not get latest updates since setState is async
    await delay(100);
    const deleted = [];
    const { taggedUsers, caption } = this.state.post;
    for (const tag of taggedUsers) {
      if (!caption.includes(tag.username)) {
        deleted.push(tag.id);
      }
    }
    return deleted;
  };

  onGoback = () => {
    Alert.alert(
      '',
      'All unsaved changes will be discarded',
      [
        {
          text: 'Discard',
          onPress: () => this.goBackAndClear(),
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  goBackAndClear = () => {
    this.props.onClearAll();
    this.props.navigation.goBack();
  };

  /* --------------------- media stuff -------------------- */

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

  /* ------------------- end media stuff ------------------ */

  performSubmitPost = () => {
    const { post } = this.state;
    if (post.caption === '' && post.media.length === 0) {
      return alertDialog('Your post cannot be empty.');
    }
    this.props.onCreatePost(post, this.goBackAndClear);
    this.props.onIncreaseTotalPostsByOne();
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
            taggedUsers={post.taggedUsers.map((u) => u.username)}
            onChangeText={this.setCaption}
            onDeleteHandle={this.onDeleteTaggedUser}
            onSelectionChange={this.handleCaptionSelectionChange}
          />
          {this.state.cursorPositionWhenTagIsActivated !== -1 ? (
            <View
              style={{
                height:
                  this.state.keyboardOffset -
                  this.state.userResultListYCoordinate,
                marginTop: 10,
              }}
              onLayout={({ nativeEvent }) =>
                this.setState({
                  userResultListYCoordinate: nativeEvent.layout.y,
                })
              }>
              <CreatePostUserResultList
                searchQuery={this.state.searchQuery}
                onSelectUserResult={this.tagUser}
              />
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
  onClearButKeepSelected: clearButKeepSelected,
  onClearAll: clearAll,
  onSetSelectedUserResults: setSelectedUserResults,
  onIncreaseTotalPostsByOne: increaseTotalPostsByOne,
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
