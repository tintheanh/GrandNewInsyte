import React from 'react';
import { connect } from 'react-redux';
import { TextBox } from '../../../components';
import { SimpleLineIcons } from '../../../constants';
import { AppState } from '../../../redux/store';
import { setRetypePassword } from '../../../redux/auth/actions';

interface RetypePasswordTextBoxProps {
  retypePassword: string;
  onSetRetypePassword: (password: string) => void;
  onWatchFocus: (...args: any) => void | any;
  onWatchBlur: (...args: any) => void | any;
}

const RetypePasswordTextBox = ({
  retypePassword,
  onSetRetypePassword,
  onWatchBlur,
  onWatchFocus,
}: RetypePasswordTextBoxProps) => {
  return (
    <TextBox
      icon={<SimpleLineIcons name="lock" size={26} color="#a6a9b4" />}
      secureTextEntry={true}
      placeholder="re-type password"
      value={retypePassword}
      onChangeText={onSetRetypePassword}
      onWatchFocus={onWatchFocus}
      onWatchBlur={onWatchBlur}
    />
  );
};

const mapStateToProps = (state: AppState) => ({
  retypePassword: state.auth.signup.retypePassword,
});

const mapDispatchToProps = {
  onSetRetypePassword: setRetypePassword,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RetypePasswordTextBox);
