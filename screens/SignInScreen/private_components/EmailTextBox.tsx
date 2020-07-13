import React from 'react';
import { connect } from 'react-redux';
import { TextBox } from '../../../components';
import { SimpleLineIcons } from '../../../constants';
import { AppState } from '../../../redux/store';
import { setSignInEmail } from '../../../redux/auth/actions';

interface EmailTextBoxProps {
  email: string;
  onSetEmail: (email: string) => void;
  onWatchFocus: (...args: any) => void | any;
  onWatchBlur: (...args: any) => void | any;
}

const EmailTextBox = ({
  email,
  onSetEmail,
  onWatchBlur,
  onWatchFocus,
}: EmailTextBoxProps) => {
  return (
    <TextBox
      icon={<SimpleLineIcons name="envelope" size={24} color="#a6a9b4" />}
      placeholder="email"
      type="email-address"
      value={email}
      onChangeText={onSetEmail}
      onWatchFocus={onWatchFocus}
      onWatchBlur={onWatchBlur}
    />
  );
};

const mapStateToProps = (state: AppState) => ({
  email: state.auth.signin.email,
});

const mapDispatchToProps = {
  onSetEmail: setSignInEmail,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailTextBox);
