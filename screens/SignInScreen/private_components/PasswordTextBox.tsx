import React from 'react';
import { SimpleLineIcons } from '../../../constants';
import { connect } from 'react-redux';
import { TextBox } from '../../../components';
import { AppState } from '../../../redux/store';
import { setSignInPassword } from '../../../redux/auth/actions';

interface PasswordTextBoxProps {
  password: string;
  onSetPassword: (password: string) => void;
  onWatchFocus: (...args: any) => void | any;
  onWatchBlur: (...args: any) => void | any;
}

const PasswordTextBox = ({
  password,
  onSetPassword,
  onWatchBlur,
  onWatchFocus,
}: PasswordTextBoxProps) => {
  return (
    <TextBox
      icon={<SimpleLineIcons name="lock" size={26} color="#a6a9b4" />}
      secureTextEntry={true}
      placeholder="password"
      value={password}
      onChangeText={onSetPassword}
      onWatchFocus={onWatchFocus}
      onWatchBlur={onWatchBlur}
    />
  );
};

const mapStateToProps = (state: AppState) => ({
  password: state.auth.signin.password,
});

const mapDispatchToProps = {
  onSetPassword: setSignInPassword,
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordTextBox);
