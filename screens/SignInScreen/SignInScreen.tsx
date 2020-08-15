import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
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
import { signin } from '../../redux/auth/actions';
import { resetAllCommentStacks } from '../../redux/comment_stack/actions';
import { resetAllReplyStacks } from '../../redux/reply_stack/actions';
import { resetAllUserStacks } from '../../redux/user_stack/actions';
import { AppState } from '../../redux/store';

const screenHeight = Layout.window.height;

type SignInScreenNavigationProp = StackNavigationProp<
  NotAuthedStackParamList,
  'SignInScreen'
>;

interface SignInScreenProps {
  navigation: SignInScreenNavigationProp;
  error: Error | null;
  loading: boolean;

  /** Method sign in with email and password
   * @param email
   * @param password
   */
  onSignIn: (email: string, password: string) => void;

  /**
   * Method clear all current post lists after
   * successfully sign in
   */
  onClearPosts: () => void;

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
 * @var email Email value changes during every keystroke
 * @var password Password value changes during every keystroke
 */
interface SignInScreenState {
  email: string;
  password: string;
}

class SignInScreen extends Component<SignInScreenProps, SignInScreenState> {
  /**
   * @var moveUpValue used for component moving up when keyboard is on
   * @var keyboardWillShowListener used for detect keyboard is on
   * @var keyboardWillHideListener used for detect keyboard is off
   */
  private moveUpValue: Animated.Value;
  private keyboardWillShowListener: EmitterSubscription | null;
  private keyboardWillHideListener: EmitterSubscription | null;

  constructor(props: SignInScreenProps) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
    this.moveUpValue = new Animated.Value(0);
    this.keyboardWillShowListener = null;
    this.keyboardWillHideListener = null;
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this.moveUp,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this.moveDown,
    );
  }

  componentWillUnmount() {
    this.keyboardWillHideListener?.remove();
    this.keyboardWillShowListener?.remove();
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

  moveUp = () => this.move(-screenHeight / 8);

  moveDown = () => this.move(0);

  navigateToSignUpScreen = () => {
    this.props.navigation.navigate('SignUpScreen');
  };

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

  performSignIn = async () => {
    const {
      navigation,
      onSignIn,
      onResetAllCommentStacks,
      onResetAllReplyStacks,
      onResetAllUserStacks,
    } = this.props;
    const { email, password } = this.state;

    this.moveDown();
    Keyboard.dismiss();

    await onSignIn(email, password);

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
    const { email, password } = this.state;

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
          <EmailTextBox value={email} setEmail={this.performSetEmail} />
          <PasswordTextBox
            value={password}
            setPassword={this.performSetPassword}
          />
          {this.renderErrorText()}
          <BigButton
            label="Sign in"
            loading={this.props.loading}
            onPress={this.performSignIn}
          />
          <View style={styles.signupView}>
            <Text style={{ color: 'white' }}>First time here? </Text>
            <TouchableOpacity onPress={this.navigateToSignUpScreen}>
              <Text style={{ color: '#bac9d4', fontWeight: 'bold' }}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
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
  signupView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
});

const mapStateToProps = (state: AppState) => ({
  error: state.auth.errors.signinError,
  loading: state.auth.loadings.signinLoading,
});

const mapDispatchToProps = {
  onSignIn: signin,
  onResetAllCommentStacks: resetAllCommentStacks,
  onResetAllReplyStacks: resetAllReplyStacks,
  onResetAllUserStacks: resetAllUserStacks,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
