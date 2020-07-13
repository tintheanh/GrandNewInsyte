import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Keyboard } from 'react-native';
import { SubmitBtn } from '../../../components';
import { AppState } from '../../../redux/store';
import { signin } from '../../../redux/auth/actions';
import { clear } from '../../../redux/posts/actions';

interface SignInBtnProps {
  loading: boolean;
  onSignIn: (email: string, password: string) => void;
  onClearPosts: () => void;
  email: string;
  password: string;
  callback: () => void;
}

class SignInBtn extends Component<SignInBtnProps> {
  shouldComponentUpdate(nextProps: SignInBtnProps) {
    if (nextProps.loading !== this.props.loading) {
      return true;
    }
    return false;
  }

  performSignIn = () => {
    const { onSignIn, onClearPosts, email, password, callback } = this.props;
    onSignIn(email, password);
    onClearPosts();
    callback();
    Keyboard.dismiss();
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
