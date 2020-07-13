import React from 'react';
import { connect } from 'react-redux';
import { SimpleLineIcons } from '../../../constants';
import { TextBox } from '../../../components';
import { AppState } from '../../../redux/store';
import { setUsername } from '../../../redux/auth/actions';

interface UsernameTextBoxProps {
  username: string;
  onSetUsername: (username: string) => void;
  onWatchFocus: (...args: any) => void | any;
  onWatchBlur: (...args: any) => void | any;
}

const UsernameTextBox = ({
  username,
  onSetUsername,
  onWatchBlur,
  onWatchFocus,
}: UsernameTextBoxProps) => {
  return (
    <TextBox
      icon={<SimpleLineIcons name="user" size={24} color="#a6a9b4" />}
      placeholder="username"
      value={username}
      onChangeText={onSetUsername}
      onWatchFocus={onWatchFocus}
      onWatchBlur={onWatchBlur}
    />
  );
};

const mapStateToProps = (state: AppState) => ({
  username: state.auth.signup.username,
});

const mapDispatchToProps = {
  onSetUsername: setUsername,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsernameTextBox);
