import React from 'react';
import { connect } from 'react-redux';
import AuthedStack from '../stacks/AuthedStack';
import NotAuthedStack from '../stacks/NotAuthedStack';
import { AppState } from '../redux/store';
import { checkAuth } from '../redux/auth/actions';
import { User } from '../models';

interface AuthScreenProps {
  user: User | null | undefined;
  loading: boolean;
  onCheckAuth: () => void;
}

// class AuthScreen extends Component<AuthScreenProps> {
//   // shouldComponentUpdate(nextProps: AuthScreenProps) {
//   //   if (nextProps.user !== this.props.user) return true;
//   //   if (nextProps.loading !== this.props.loading) return true;
//   //   return false;
//   // }

//   // componentDidMount() {
//   //   this.props.onCheckAuth();
//   // }

//   render() {
//     // console.log(this.props.user);
//     // if (!this.props.user && this.props.loading) return <Loading />;
//     return this.props.user ? <AuthedStack /> : <NotAuthedStack />;
//   }
// }

const AuthScreen = (props: AuthScreenProps) =>
  props.user ? <AuthedStack /> : <NotAuthedStack />;

const mapStateToProps = (state: AppState) => ({
  user: state.auth.user,
});

const mapDispatchToProps = {
  onCheckAuth: checkAuth,
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthScreen);
