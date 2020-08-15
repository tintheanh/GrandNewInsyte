import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  EmitterSubscription,
  Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { NotAuthedStackParamList } from '../../stacks/NotAuthedStack';
import { Colors, Layout } from '../../constants';
import {
  ErrorText,
  EmailTextBox,
  PasswordTextBox,
  BigButton,
} from '../../components';
import { UsernameTextBox, RetypePasswordTextBox } from './private_components';
import { signup, clearSignUpError } from '../../redux/auth/actions';
import { resetAllCommentStacks } from '../../redux/comment_stack/actions';
import { resetAllReplyStacks } from '../../redux/reply_stack/actions';
import { resetAllUserStacks } from '../../redux/user_stack/actions';
import { AppState } from '../../redux/store';

const screenHeight = Layout.window.height;

type SignUpScreenNavigationProp = StackNavigationProp<
  NotAuthedStackParamList,
  'SignUpScreen'
>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
  error: Error | null;
  loading: boolean;

  /** Method sign up with email and password
   * @param username
   * @param email
   * @param password
   * @param retypePassword
   */
  onSignUp: (
    username: string,
    email: string,
    password: string,
    retypePassword: string,
  ) => void;

  /**
   * Method clear sign up error, the error is
   * not automatically swallowed so needs to clear
   * when screen going back
   */
  onClearSignUpError: () => void;

  /**
   * Method clear comment stack when successfully sign in
   */
  onResetAllCommentStacks: () => void;

  /**
   * Method clear reply stack when successfully sign in
   */
  onResetAllReplyStacks: () => void;

  /**
   * Method clear user stack when successfully sign in
   */
  onResetAllUserStacks: () => void;
}

/**
 * Local state
 * @var username Email value changes during every keystroke
 * @var email Email value changes during every keystroke
 * @var password Password value changes during every keystroke
 * @var retypePassword Retype-password value changes during every keystroke
 */
interface SignUpScreenState {
  username: string;
  email: string;
  password: string;
  retypePassword: string;
}

class SignUpScreen extends Component<SignUpScreenProps, SignUpScreenState> {
  /**
   * @var moveUpValue used for component moving up when keyboard is on
   * @var keyboardWillShowListener used for detect keyboard is on
   * @var keyboardWillHideListener used for detect keyboard is off
   * @var detectScreenGoBackUnsubscriber unsubscriber function when screen going back
   */
  private moveUpValue: Animated.Value;
  private keyboardWillShowListener: EmitterSubscription | null;
  private keyboardWillHideListener: EmitterSubscription | null;
  private detectScreenGoBackUnsubscriber: () => void = () => {};

  constructor(props: SignUpScreenProps) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      retypePassword: '',
    };
    this.moveUpValue = new Animated.Value(0);
    this.keyboardWillShowListener = null;
    this.keyboardWillHideListener = null;
  }

  componentDidMount() {
    const { navigation, onClearSignUpError } = this.props;
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this.moveUp,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this.moveDown,
    );
    this.detectScreenGoBackUnsubscriber = navigation.addListener(
      'beforeRemove',
      () => onClearSignUpError(),
    );
  }

  componentWillUnmount() {
    this.keyboardWillHideListener?.remove();
    this.keyboardWillShowListener?.remove();
    this.detectScreenGoBackUnsubscriber();
  }

  /**
   * Method move component vertically, triggered when
   * keyboard is on/off
   * @param value Moving value in pixel counting from the
   * starting point, '+' move down, '-' move up
   * @param duration Time in milliseconds need to take to finish animation
   */
  move = (value: number, duration = 200) => {
    Animated.timing(this.moveUpValue, {
      toValue: value,
      duration,
      useNativeDriver: true,
    }).start();
  };

  moveUp = () => this.move(-screenHeight / 6);

  moveDown = () => this.move(0);

  /**
   * Method set email value
   * @param username New username value to set
   */
  performSetUsername = (username: string) => this.setState({ username });

  /**
   * Method set email value
   * @param email New email value to set
   */
  performSetEmail = (email: string) => this.setState({ email });

  /**
   * Method set password value
   * @param password New password value to set
   */
  performSetPassword = (password: string) => this.setState({ password });

  /**
   * Method set retype-password value
   * @param retypePassword New retypePassword value to set
   */
  performSetRetypePassword = (retypePassword: string) =>
    this.setState({ retypePassword });

  performSignUp = async () => {
    const {
      navigation,
      onSignUp,
      onResetAllCommentStacks,
      onResetAllReplyStacks,
      onResetAllUserStacks,
    } = this.props;
    const { username, email, password, retypePassword } = this.state;

    this.moveDown();
    Keyboard.dismiss();

    await onSignUp(username, email, password, retypePassword);

    if (this.props.error === null) {
      // clear all stacks after successfully sign in
      onResetAllCommentStacks();
      onResetAllReplyStacks();
      onResetAllUserStacks();

      // forcefully navigate to Home after successfully sign in
      navigation.dangerouslyGetParent()!.dispatch(
        CommonActions.navigate({
          name: 'HomeScreen',
        }),
      );
    }
  };

  renderErrorText = () => {
    const { error } = this.props;
    return (
      <View style={{ marginTop: 12 }}>
        <ErrorText text={error ? error.message : ' '} />
      </View>
    );
  };

  render() {
    const { username, email, password, retypePassword } = this.state;

    const animStyle = {
      transform: [
        {
          translateY: this.moveUpValue,
        },
      ],
    };

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.textBoxsWrapper, animStyle]}>
          <UsernameTextBox
            value={username}
            setUsername={this.performSetUsername}
          />
          <EmailTextBox value={email} setEmail={this.performSetEmail} />
          <PasswordTextBox
            value={password}
            setPassword={this.performSetPassword}
          />
          <RetypePasswordTextBox
            value={retypePassword}
            setRetypePassword={this.performSetRetypePassword}
          />
          {this.renderErrorText()}
          <BigButton
            label="Sign up"
            loading={this.props.loading}
            onPress={this.performSignUp}
          />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brightColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxsWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state: AppState) => ({
  error: state.auth.errors.signupError,
  loading: state.auth.loadings.signupLoading,
});

const mapDispatchToProps = {
  onSignUp: signup,
  onClearSignUpError: clearSignUpError,
  onResetAllCommentStacks: resetAllCommentStacks,
  onResetAllReplyStacks: resetAllReplyStacks,
  onResetAllUserStacks: resetAllUserStacks,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUpScreen);
