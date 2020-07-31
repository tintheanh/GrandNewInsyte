import {
  SIGN_IN_STARTED,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_UP_FAILURE,
  SIGN_UP_STARTED,
  SIGN_UP_SUCCESS,
  SIGN_OUT_FAILURE,
  SIGN_OUT_STARTED,
  SIGN_OUT_SUCCESS,
  AuthAction,
  AuthState,
  ON_SIGNIN_EMAIL_CHANGE,
  ON_SIGNIN_PASSWORD_CHANGE,
  ON_SIGNUP_EMAIL_CHANGE,
  ON_SIGNUP_PASSWORD_CHANGE,
  ON_RETYPE_PASSWORD_CHANGE,
  ON_USERNAME_CHANGE,
  CHECK_AUTH_STARTED,
  CHECK_AUTH_SUCCESS,
  CHECK_AUTH_FAILURE,
  EDIT_PROFILE_FAILURE,
  EDIT_PROFILE_END,
  EDIT_PROFILE_STARTED,
  EDIT_PROFILE_SUCCESS,
  INCREASE_TOTAL_POSTS_BY_ONE,
  DECREASE_TOTAL_POSTS_BY_ONE,
  INCREASE_FOLLOWING_BY_ONE,
  DECREASE_FOLLOWING_BY_ONE,
} from './types';
import { User } from '../../models';

const initialState: AuthState = {
  signin: {
    loading: false,
    email: '',
    password: '',
    error: null,
  },
  signup: {
    loading: false,
    username: '',
    email: '',
    password: '',
    retypePassword: '',
    error: null,
  },
  signout: {
    loading: false,
    error: null,
  },
  loading: false,
  update: {
    loading: false,
    error: null,
  },
  user: undefined,
  error: null,
};

export default function authReducer(
  state = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case ON_SIGNIN_EMAIL_CHANGE: {
      const newState = { ...state };
      newState.signin.email = action.payload as string;
      return newState;
    }
    case ON_SIGNIN_PASSWORD_CHANGE: {
      const newState = { ...state };
      newState.signin.password = action.payload as string;
      return newState;
    }
    case ON_SIGNUP_EMAIL_CHANGE: {
      const newState = { ...state };
      newState.signup.email = action.payload as string;
      return newState;
    }
    case ON_SIGNUP_PASSWORD_CHANGE: {
      const newState = { ...state };
      newState.signup.password = action.payload as string;
      return newState;
    }
    case ON_USERNAME_CHANGE: {
      const newState = { ...state };
      newState.signup.username = action.payload as string;
      return newState;
    }
    case ON_RETYPE_PASSWORD_CHANGE: {
      const newState = { ...state };
      newState.signup.retypePassword = action.payload as string;
      return newState;
    }
    case SIGN_IN_STARTED: {
      const newState = { ...state };
      newState.signin.loading = true;
      newState.signin.error = null;
      return newState;
    }
    case SIGN_IN_SUCCESS: {
      const newState = { ...state };
      newState.signin.loading = false;
      newState.signin.error = null;
      newState.signin.email = '';
      newState.signin.password = '';
      newState.user = action.payload as User;
      return newState;
    }
    case SIGN_IN_FAILURE: {
      const newState = { ...state };
      newState.signin.loading = false;
      newState.signin.error = action.payload as Error;
      return newState;
    }
    case SIGN_UP_STARTED: {
      const newState = { ...state };
      newState.signup.loading = true;
      newState.signup.error = null;
      return newState;
    }
    case SIGN_UP_SUCCESS: {
      const newState = { ...state };
      newState.signup.loading = false;
      newState.signup.error = null;
      newState.signup.email = '';
      newState.signup.password = '';
      newState.signup.retypePassword = '';
      newState.user = action.payload as User;
      return newState;
    }
    case SIGN_UP_FAILURE: {
      const newState = { ...state };
      newState.signup.loading = false;
      newState.signup.error = action.payload as Error;
      return newState;
    }
    case CHECK_AUTH_STARTED: {
      const newState = { ...state };
      newState.loading = true;
      newState.error = null;
      return newState;
    }
    case CHECK_AUTH_SUCCESS: {
      const newState = { ...state };
      newState.user = action.payload as User;
      newState.error = null;
      newState.loading = false;
      return newState;
    }
    case CHECK_AUTH_FAILURE: {
      const newState = { ...state };
      newState.error = action.payload as Error;
      newState.loading = false;
      return newState;
    }
    case SIGN_OUT_STARTED: {
      const newState = { ...state };
      newState.signout.loading = true;
      newState.signout.error = null;
      return newState;
    }
    case SIGN_OUT_SUCCESS: {
      return {
        signin: {
          loading: false,
          email: '',
          password: '',
          error: null,
        },
        signup: {
          loading: false,
          username: '',
          email: '',
          password: '',
          retypePassword: '',
          error: null,
        },
        signout: {
          loading: false,
          error: null,
        },
        loading: false,
        update: {
          loading: false,
          error: null,
        },
        user: null,
        error: null,
      };
    }
    case SIGN_OUT_FAILURE: {
      const newState = { ...state };
      newState.signout.error = action.payload as Error;
      newState.signout.loading = false;
      return newState;
    }
    case EDIT_PROFILE_STARTED: {
      const newState = { ...state };
      newState.update.loading = true;
      newState.update.error = null;
      return newState;
    }
    case EDIT_PROFILE_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        avatar: string;
        name: string;
        bio: string;
      };
      newState.user!.avatar = payload.avatar;
      newState.user!.name = payload.name;
      newState.user!.bio = payload.bio;
      newState.update.error = null;
      newState.update.loading = false;
      return newState;
    }
    case EDIT_PROFILE_FAILURE: {
      const newState = { ...state };
      newState.update.loading = false;
      newState.update.error = action.payload as Error;
      return newState;
    }
    case EDIT_PROFILE_END: {
      const newState = { ...state };
      newState.update.loading = false;
      return newState;
    }
    case INCREASE_TOTAL_POSTS_BY_ONE: {
      const newState = { ...state };
      if (newState.user) {
        newState.user.totalPosts += 1;
      }
      return newState;
    }
    case DECREASE_TOTAL_POSTS_BY_ONE: {
      const newState = { ...state };
      if (newState.user) {
        newState.user.totalPosts -= 1;
      }
      return newState;
    }
    case INCREASE_FOLLOWING_BY_ONE: {
      const newState = { ...state };
      if (newState.user) {
        newState.user.following += 1;
      }
      return newState;
    }
    case DECREASE_FOLLOWING_BY_ONE: {
      const newState = { ...state };
      if (newState.user) {
        newState.user.following -= 1;
      }
      return newState;
    }
    default:
      return state;
  }
}
