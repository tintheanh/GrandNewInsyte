import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {
  PrivacySelection,
  LocationSelection,
  TextPostInput,
  MediaInput,
} from './private_components';
import { Colors } from '../../constants';

const DismissKeyboard = ({ children }: any): JSX.Element => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

class CreatePostScreen extends Component<any, any> {
  state = {
    privacy: 'public',
    caption: '',
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
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'any',
      });
      console.log(images);
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <DismissKeyboard>
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
                onPress={() => console.log('post')}>
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
            <MediaInput onOpenPhotoLibrary={this.pickMedia} />
          </View>
        </View>
      </DismissKeyboard>
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
