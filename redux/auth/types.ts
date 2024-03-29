import { User, Post } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SIGN_IN_STARTED = 'SIGN_IN_STARTED',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE = 'SIGN_IN_FAILURE',

  SIGN_UP_STARTED = 'SIGN_UP_STARTED',
  SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS',
  SIGN_UP_FAILURE = 'SIGN_UP_FAILURE',

  SIGN_OUT_STARTED = 'SIGN_OUT_STARTED',
  SIGN_OUT_SUCCESS = 'SIGN_OUT_SUCCESS',
  SIGN_OUT_FAILURE = 'SIGN_OUT_FAILURE',

  CHECK_AUTH_STARTED = 'CHECK_AUTH_STARTED',
  CHECK_AUTH_SUCCESS = 'CHECK_AUTH_SUCCESS',
  CHECK_AUTH_FAILURE = 'CHECK_AUTH_FAILURE',

  EDIT_PROFILE_STARTED = 'EDIT_PROFILE_STARTED',
  EDIT_PROFILE_SUCCESS = 'EDIT_PROFILE_SUCCESS',
  EDIT_PROFILE_FAILURE = 'EDIT_PROFILE_FAILURE',

  REFRESH_PROFILE_SUCCESS = 'REFRESH_PROFILE_SUCCESS',

  INCREASE_TOTAL_POSTS_BY_ONE = 'INCREASE_TOTAL_POSTS_BY_ONE',
  DECREASE_TOTAL_POSTS_BY_ONE = 'DECREASE_TOTAL_POSTS_BY_ONE',

  INCREASE_FOLLOWING_BY_ONE = 'INCREASE_FOLLOWING_BY_ONE',
  DECREASE_FOLLOWING_BY_ONE = 'DECREASE_FOLLOWING_BY_ONE',

  CLEAR_SIGNUP_ERROR = 'CLEAR_SIGNUP_ERROR',
}

export interface AuthAction {
  type: string;
  payload:
    | User
    | Error
    | string
    | {
        avatar: string;
        name: string;
        bio: string;
      }
    | {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
      }
    | Array<any>
    | null;
}

export interface AuthState {
  /**
   * undefined means the app doesn't know
   * whether there's a user signed in yet
   */
  user: User | null | undefined;
  loadings: {
    checkAuthLoading: boolean;
    signinLoading: boolean;
    signoutLoading: boolean;
    signupLoading: boolean;
  };
  errors: {
    checkAuthError: Error | null;
    signinError: Error | null;
    signoutError: Error | null;
    signupError: Error | null;
  };
  update: {
    loading: boolean;
    error: Error | null;
  };
}
