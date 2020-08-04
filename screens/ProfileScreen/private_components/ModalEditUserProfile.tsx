import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import UserProfileAvatar from './UserProfileAvatar';
import { editProfile } from '../../../redux/auth/actions';
import { AppState } from '../../../redux/store';
import { ErrorText } from '../../../components';
import { alertDialog } from '../../../utils/functions';
import { Colors, Layout } from '../../../constants';

const width = Layout.window.width;

interface ModalEditUserProfileProps {
  /**
   * Props received from outside
   */
  avatar: string;
  name: string;
  bio: string;

  loading: boolean;
  error: Error | null;

  /**
   * Method edit profile
   * @param avatar
   * @param name
   * @param bio
   */
  onEditProfile: (avatar: string, name: string, bio: string) => void;

  /**
   * Method close modal when updating is done/cancelled
   */
  closeModal: () => void;
}

/**
 * Local state
 */
interface ModalEditUserProfileState {
  avatar: string;
  name: string;
  bio: string;
}

class ModalEditUserProfile extends Component<
  ModalEditUserProfileProps,
  ModalEditUserProfileState
> {
  constructor(props: ModalEditUserProfileProps) {
    super(props);
    // use value from props as default
    this.state = {
      avatar: this.props.avatar,
      name: this.props.name,
      bio: this.props.bio,
    };
  }

  /**
   * Method set new name value
   * @param name Name value to set
   */
  onSetName = (name: string) => this.setState({ name });

  /**
   * Method set new bio value
   * @param bio Bio value to set
   */
  onSetBio = (bio: string) => this.setState({ bio });

  /**
   * Method prompt to close modal
   */
  onCloseModal = () => {
    Alert.alert(
      '',
      'All unsaved changes will be discarded',
      [
        {
          text: 'Discard',
          onPress: this.props.closeModal,
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  /**
   * Method open and pick image from the library
   */
  pickImage = async () => {
    try {
      const result: any = await ImagePicker.openPicker({
        mediaType: 'photo',
        width: 200,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });
      this.setState({ avatar: result.path as string });
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        alertDialog('Error occured. Please try again!');
      }
    }
  };

  /**
   * Method perform update profile and close modal when done
   */
  performUpdateProfile = async () => {
    const { avatar, name, bio } = this.state;
    Keyboard.dismiss();

    await this.props.onEditProfile(avatar, name, bio);
    if (!this.props.error) {
      this.props.closeModal();
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.modalView}>
          <View style={styles.btnWrapper}>
            <TouchableOpacity
              style={{ alignSelf: 'flex-start' }}
              onPress={this.onCloseModal}
              disabled={this.props.loading}>
              <Text
                style={{
                  color: 'white',
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignSelf: 'flex-start' }}
              onPress={this.performUpdateProfile}
              disabled={this.props.loading}>
              <Text
                style={{
                  color: 'white',
                }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.avatarWrapper}>
            <UserProfileAvatar avatar={this.state.avatar} />
          </View>
          <TouchableOpacity onPress={this.pickImage}>
            <Text style={styles.changePhotoBtnLabel}>Change Profile Photo</Text>
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              value={this.state.name}
              onChangeText={this.onSetName}
              style={styles.inputbox}
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Bio{'    '}</Text>
            <TextInput
              multiline
              value={this.state.bio}
              onChangeText={this.onSetBio}
              style={styles.inputbox}
              autoCorrect={false}
            />
          </View>
          {this.props.error ? (
            <View style={styles.errorWrapper}>
              <ErrorText text={this.props.error.message} />
            </View>
          ) : null}

          {this.props.loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator
                size="large"
                color="rgba(255, 255, 255, 0.6)"
              />
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalView: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 22,
    paddingRight: 22,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.darkColor,
    alignItems: 'center',
    flex: 1,
  },
  btnWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    paddingTop: 22,
    paddingBottom: 22,
  },
  changePhotoBtnLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingTop: 22,
    width: '100%',
  },
  inputbox: {
    maxWidth: width - 104,
    flexGrow: 1,
    paddingBottom: 12,
    color: 'white',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#737583',
  },
  inputLabel: {
    color: 'white',
    paddingRight: 22,
  },
  errorWrapper: {
    marginTop: 22,
  },
});

const mapStateToProps = (state: AppState) => ({
  loading: state.auth.update.loading,
  error: state.auth.update.error,
});

const mapDisPatchToProps = {
  onEditProfile: editProfile,
};

export default connect(
  mapStateToProps,
  mapDisPatchToProps,
)(ModalEditUserProfile);
