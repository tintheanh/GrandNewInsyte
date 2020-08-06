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
import { createComment } from '../../../redux/commentsStack/actions';
import { AppState } from '../../../redux/store';
import { alertDialog } from '../../../utils/functions';

interface CommentInputProps {
  /**
   * Parent post's ID for the new comment to add into
   */
  postID: string;

  /**
   * Loading when create comment.
   * Used for disabling submit button when creating comment
   */
  loading: boolean;

  /**
   * Method create new comment
   * @param postID Parent post's ID for the new comment to add into
   * @param content
   */
  onCreateComment: (postID: string, content: string) => void;

  /**
   * Method increase comment number on post screen
   */
  increaseCommentsForPostScreenBy: (by: number) => void;

  /**
   * Method increase comment number for each post card on home screen
   */
  increaseCommentsForHomeScreen: (
    postID: string,
    numberOfReplies: number,
  ) => void;
}

/**
 * Local state
 */
interface CommentInputState {
  text: string;

  /**
   * State to keep track of height of TextInput.
   * Used in expanding TextInput as its content grows
   */
  textInputHeight: number;
}

class CommentInput extends Component<CommentInputProps, CommentInputState> {
  /**
   * @var keyboardWillShowListener detect when keyboard is on
   * @var keyboardWillHideListener detect when keyboard is off
   * @var moveAnimation animation value for moving keyboard vertically
   */
  private keyboardWillShowListener: EmitterSubscription | null = null;
  private keyboardWillHideListener: EmitterSubscription | null = null;
  private moveAnimation: Animated.Value;

  constructor(props: CommentInputProps) {
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
      this.keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardWillHide,
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowListener!.remove();
    this.keyboardWillHideListener!.remove();
  }

  keyboardWillShow = (event: any) => {
    this.move(-event.endCoordinates.height + bottomTabHeight, 270);
  };

  keyboardWillHide = () => {
    this.move(0, 100);
  };

  /**
   * Method move vertically
   * @param value Move to value
   * @param duration Duration in milliseconds
   */
  move = (value: number, duration: number) => {
    Animated.timing(this.moveAnimation, {
      toValue: value,
      duration,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Method set content for comment
   * @param text New content to set
   */
  setCommentContent = (text: string) => this.setState({ text });

  performSubmitComment = () => {
    const { text } = this.state;
    if (!text.length) {
      return alertDialog('Comment cannot be empty');
    }
    const {
      postID,
      increaseCommentsForHomeScreen,
      onCreateComment,
      increaseCommentsForPostScreenBy,
    } = this.props;

    // increase number of comments for post and home screen
    increaseCommentsForPostScreenBy(1);
    increaseCommentsForHomeScreen(postID, 1);

    Keyboard.dismiss();

    // submit comment
    onCreateComment(postID, text);

    // create old text for the next comment
    this.setState({ text: '' });
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
          onChangeText={this.setCommentContent}
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

const mapStateToProps = (state: AppState) => {
  const { currentTab } = state.commentsStack;
  return {
    loading:
      state.commentsStack[currentTab].top()?.loadings.createCommentLoading ??
      false,
  };
};

const mapDispatchToProps = {
  onCreateComment: createComment,
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentInput);
