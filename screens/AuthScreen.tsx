import React from 'react';
import { connect } from 'react-redux';
import AuthedStack from '../stacks/AuthedStack';
import NotAuthedStack from '../stacks/NotAuthedStack';
import { AppState } from '../redux/store';
import { User } from '../models';

interface AuthScreenProps {
  user: User | null | undefined;
  loading: boolean;
}

function AuthScreen({ user }: AuthScreenProps) {
  return user ? <AuthedStack /> : <NotAuthedStack />;
}

const mapStateToProps = (state: AppState) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(AuthScreen);
