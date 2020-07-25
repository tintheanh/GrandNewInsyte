import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { Keyboard } from 'react-native';
import { SubmitBtn } from '../../../components';
import { AppState } from '../../../redux/store';
import { signin } from '../../../redux/auth/actions';
import { clear } from '../../../redux/posts/actions';
import { delay } from '../../../utils/functions';

interface SignInBtnProps {
  loading: boolean;
  onSignIn: (email: string, password: string) => void;
  onClearPosts: () => void;
  email: string;
  password: string;
  callback: () => void;
  navigation: any;
}

class SignInBtn extends Component<SignInBtnProps> {
  shouldComponentUpdate(nextProps: SignInBtnProps) {
    if (nextProps.loading !== this.props.loading) {
      return true;
    }
    return false;
  }

  performSignIn = async () => {
    const { onSignIn, onClearPosts, email, password, callback } = this.props;
    onSignIn(email, password);
    callback();
    Keyboard.dismiss();
    onClearPosts();
    await delay(700);
    this.props.navigation.dangerouslyGetParent().dispatch(
      CommonActions.navigate({
        name: 'HomeScreen',
      }),
    );
  };
  render() {
    return (
      <SubmitBtn
        disable={this.props.loading}
        label="Sign in"
        onPress={this.performSignIn}
      />
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  loading: state.auth.signin.loading,
  email: state.auth.signin.email,
  password: state.auth.signin.password,
});

const mapDispatchToProps = {
  onSignIn: signin,
  onClearPosts: clear,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignInBtn);
