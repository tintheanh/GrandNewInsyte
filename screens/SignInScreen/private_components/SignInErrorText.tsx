import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { ErrorText } from '../../../components';
import { AppState } from '../../../redux/store';

interface SignInErrorTextProps {
  signinError: Error | null;
}

const SignInErrorText = React.memo(({ signinError }: SignInErrorTextProps) => {
  return (
    <View style={{ marginTop: 12 }}>
      <ErrorText text={signinError ? signinError.message : ' '} />
    </View>
  );
});

const mapStateToProps = (state: AppState) => ({
  signinError: state.auth.signin.error,
});

export default connect(mapStateToProps)(SignInErrorText);
