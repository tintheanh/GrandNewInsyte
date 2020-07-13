import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { ErrorText } from '../../../components';
import { AppState } from '../../../redux/store';

interface SignUpErrorTextProps {
  signupError: Error | null;
}

const SignUpErrorText = React.memo(({ signupError }: SignUpErrorTextProps) => {
  return (
    <View style={{ marginTop: 12 }}>
      <ErrorText text={signupError ? signupError.message : ' '} />
    </View>
  );
});

const mapStateToProps = (state: AppState) => ({
  signupError: state.auth.signup.error,
});

export default connect(mapStateToProps)(SignUpErrorText);
