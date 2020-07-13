import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Keyboard } from 'react-native';
import { SubmitBtn } from '../../../components';
import { AppState } from '../../../redux/store';
import { signup } from '../../../redux/auth/actions';

interface SignUpBtnProps {
  loading: boolean;
  onSignUp: (
    username: string,
    email: string,
    password: string,
    retypePassword: string,
  ) => void;
  email: string;
  username: string;
  password: string;
  retypePassword: string;
  callback: () => void;
}

class SignUpBtn extends Component<SignUpBtnProps> {
  shouldComponentUpdate(nextProps: SignUpBtnProps) {
    if (nextProps.loading !== this.props.loading) {
      return true;
    }
    return false;
  }

  performSignIn = () => {
    const {
      onSignUp,
      username,
      email,
      password,
      retypePassword,
      callback,
    } = this.props;
    onSignUp(username, email, password, retypePassword);
    callback();
    Keyboard.dismiss();
  };
  render() {
    return (
      <SubmitBtn
        disable={this.props.loading}
        label="Sign up"
        onPress={this.performSignIn}
      />
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  loading: state.auth.signup.loading,
  username: state.auth.signup.username,
  email: state.auth.signup.email,
  password: state.auth.signup.password,
  retypePassword: state.auth.signup.retypePassword,
});

const mapDispatchToProps = {
  onSignUp: signup,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUpBtn);
