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
import { createReply } from '../../../redux/reply_stack/actions';
import { AppState } from '../../../redux/store';
import { alertDialog } from '../../../utils/functions';

interface ReplyInputProps {
  /**
   * Parent comment's ID for the new reply to add into
   */
  commentID: string;

  /**
   * Loading when create reply.
   * Used for disabling submit button when creating reply
   */
  loading: boolean;

  /**
   * Method create new reply
   * @param commentID Parent comment's ID for the new reply to add into
   * @param content
   */
  onCreateReply: (commentID: string, content: string) => void;

  /**
   * Method increase reply number on reply screen
   * @param numberOfReplies Number of replies to increase to
   */
  increaseRepliesForReplyScreenBy: (numberOfReplies: number) => void;

  /**
   * Method increase reply number on post screen
   */
  increaseRepliesForPostScreen: () => void;

  /**
   * Method increase comment number on post screen
   */
  increaseCommentsForPostScreen: () => void;

  /**
   * Method increase comment number on home screen
   */
  increaseCommentsForHomeScreen: () => void;
}

/**
 * Local state
 */
interface ReplyInputState {
  text: string;

  /**
   * State to keep track of height of TextInput.
   * Used in expanding TextInput as its content grows
   */
  textInputHeight: number;
}

class ReplyInput extends Component<ReplyInputProps, ReplyInputState> {
  /**
   * @var keyboardWillShowListener detect when keyboard is on
   * @var keyboardWillHideListener detect when keyboard is off
   * @var moveAnimation animation value for moving keyboard vertically
   */
  private keyboardWillShowListener: EmitterSubscription | null = null;
  private keyboardWillHideListener: EmitterSubscription | null = null;
  private moveAnimation: Animated.Value;

  constructor(props: ReplyInputProps) {
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
   * Method set content for reply
   * @param text New content to set
   */
  setReplyContent = (text: string) => this.setState({ text });

  performSubmitReply = () => {
    const { text } = this.state;
    if (!text.length) {
      return alertDialog('Reply cannot be empty');
    }
    const {
      commentID,
      increaseRepliesForReplyScreenBy,
      increaseRepliesForPostScreen,
      increaseCommentsForHomeScreen,
      increaseCommentsForPostScreen,
      onCreateReply,
    } = this.props;

    // increase reply number on reply screen
    increaseRepliesForReplyScreenBy(1);

    // increase reply number for each reply card on post screen
    increaseRepliesForPostScreen();

    // increase comment number on post screen
    increaseCommentsForPostScreen();

    // increase comment number for each post card on home screen
    increaseCommentsForHomeScreen();
    Keyboard.dismiss();

    // submit reply
    onCreateReply(commentID, text);

    // reset text for the next reply
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
          onChangeText={this.setReplyContent}
          onContentSizeChange={(event) => {
            this.setState({
              textInputHeight: event.nativeEvent.contentSize.height,
            });
          }}
          value={this.state.text}
          autoCorrect={false}
          multiline
          placeholder="Write a reply"
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
          onPress={this.performSubmitReply}
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
  const { currentTab } = state.replyStack;
  return {
    loading:
      state.replyStack[currentTab].top()?.loadings.createReplyLoading ?? false,
  };
};

const mapDispatchToProps = {
  onCreateReply: createReply,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyInput);
