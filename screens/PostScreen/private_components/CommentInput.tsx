import React, { Component } from 'react';
import {
  Animated,
  TextInput,
  Keyboard,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  EmitterSubscription,
} from 'react-native';
import { connect } from 'react-redux';
import {
  Colors,
  bottomTabHeight,
  MaterialCommunityIcons,
} from '../../../constants';
import { createComment } from '../../../redux/postComments/actions';
import { AppState } from '../../../redux/store';
import { alertDialog } from '../../../utils/functions';

interface CommentInputState {
  text: string;
  textInputHeight: number;
}

interface CommentInputProps {
  loading: boolean;
  postID: string;
  error: Error | null;
  onCreateComment: (content: string) => void;
  increaseCommentNumberForPostScreen: () => void;
  decreaseCommentNumberForPostScreen: () => void;
  decreaseCommentNumberForHomeScreen: (postID: string) => void;
  increaseCommentNumberForHomeScreen: (postID: string) => void;
}

class CommentInput extends Component<CommentInputProps, CommentInputState> {
  private keyboardWillShowListener: EmitterSubscription | null = null;
  private keyboardWillHideListener: EmitterSubscription | null = null;
  private moveAnimation: Animated.Value;

  constructor(props: any) {
    super(props);
    this.state = {
      text: '',
      textInputHeight: 0,
    };
    this.moveAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide,
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowListener!.remove();
    this.keyboardWillHideListener!.remove();
  }

  _keyboardWillShow = (event: any) => {
    this._move(-event.endCoordinates.height + bottomTabHeight, 270);
  };

  _keyboardWillHide = () => {
    this._move(0, 100);
  };

  _move = (value: number, duration: number) => {
    Animated.timing(this.moveAnimation, {
      toValue: value,
      duration,
      useNativeDriver: true,
    }).start();
  };

  performSubmitComment = async () => {
    const { text } = this.state;
    if (!text.length) {
      return alertDialog('Comment cannot be empty');
    }
    const {
      postID,
      decreaseCommentNumberForHomeScreen,
      increaseCommentNumberForHomeScreen,
      onCreateComment,
      increaseCommentNumberForPostScreen,
      decreaseCommentNumberForPostScreen,
    } = this.props;
    increaseCommentNumberForPostScreen();
    increaseCommentNumberForHomeScreen(postID);
    Keyboard.dismiss();
    this.setState({ text: '' });
    await onCreateComment(text);
    if (this.props.error !== null) {
      decreaseCommentNumberForPostScreen();
      decreaseCommentNumberForHomeScreen(postID);
    }
  };

  render() {
    const animStyle = {
      transform: [
        {
          translateY: this.moveAnimation,
        },
      ],
    };
    return (
      <Animated.View style={[styles.wrapper, animStyle]}>
        <TextInput
          onChangeText={(text) => this.setState({ text })}
          onContentSizeChange={(event) => {
            this.setState({
              textInputHeight: event.nativeEvent.contentSize.height,
            });
          }}
          value={this.state.text}
          autoCorrect={false}
          multiline
          placeholder="Write a comment"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={[
            styles.input,
            {
              height: Math.max(30, this.state.textInputHeight),
              maxHeight: 100,
            },
          ]}
        />
        <TouchableWithoutFeedback
          onPress={this.performSubmitComment}
          disabled={this.props.loading}>
          <View style={styles.submitBtn}>
            <MaterialCommunityIcons
              name="send"
              size={24}
              color="white"
              style={{ opacity: this.props.loading ? 0.4 : 1 }}
            />
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    maxHeight: 116,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: Colors.darkColor,
    borderTopColor: Colors.brightColor,
    borderTopWidth: 1,
  },
  input: {
    color: 'white',
    width: '90%',
    zIndex: 100,
    backgroundColor: Colors.brightColor,
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 18,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 18,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  submitBtn: {
    padding: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

const mapStateToProps = (state: AppState) => ({
  loading: state.postComments.stack.top()?.createCommentLoading ?? false,
  error: state.postComments.stack.top()?.createCommentError ?? null,
  postID: state.postComments.stack.top()?.postID ?? '',
});

const mapDispatchToProps = {
  onCreateComment: createComment,
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentInput);
