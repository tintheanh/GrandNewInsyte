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
import { createReply } from '../../../redux/repliesStack/actions';
import { AppState } from '../../../redux/store';
import { alertDialog } from '../../../utils/functions';

interface ReplyInputState {
  text: string;
  textInputHeight: number;
}

interface ReplyInputProps {
  loading: boolean;
  error: Error | null;
  onCreateReply: (content: string) => void;
  increaseRepliesForReplyScreenBy: (numberOfReplies: number) => void;
  increaseRepliesForPostScreen: () => void;
  increaseCommentsForPostScreen: () => void;
  increaseCommentsForHomeScreen: () => void;
}

class ReplyInput extends Component<ReplyInputProps, ReplyInputState> {
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

  setCommentContent = (text: string) => this.setState({ text });

  performSubmitReply = () => {
    const { text } = this.state;
    if (!text.length) {
      return alertDialog('Reply cannot be empty');
    }
    const {
      increaseRepliesForReplyScreenBy,
      increaseRepliesForPostScreen,
      increaseCommentsForHomeScreen,
      increaseCommentsForPostScreen,
      onCreateReply,
    } = this.props;
    increaseRepliesForReplyScreenBy(1);
    increaseRepliesForPostScreen();
    increaseCommentsForPostScreen();
    increaseCommentsForHomeScreen();
    Keyboard.dismiss();
    onCreateReply(text);
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
  const { currentTab } = state.repliesStack;
  return {
    loading: state.repliesStack[currentTab].top()?.createReplyLoading ?? false,
    error: state.repliesStack[currentTab].top()?.createReplyError ?? null,
  };
};

const mapDispatchToProps = {
  onCreateReply: createReply,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyInput);
