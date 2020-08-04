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

  FETCH_USER_POSTS_STARTED = 'FETCH_USER_POSTS_STARTED',
  FETCH_USER_POSTS_SUCCESS = 'FETCH_USER_POSTS_SUCCESS',
  FETCH_USER_POSTS_FAILURE = 'FETCH_USER_POSTS_FAILURE',

  EDIT_PROFILE_STARTED = 'EDIT_PROFILE_STARTED',
  EDIT_PROFILE_SUCCESS = 'EDIT_PROFILE_SUCCESS',
  EDIT_PROFILE_FAILURE = 'EDIT_PROFILE_FAILURE',
  EDIT_PROFILE_END = 'EDIT_PROFILE_END',

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
        user: User | null;
        posts: Array<Post>;
        taggedPosts: Array<Post>;
        lastPostVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
        lastTaggedPostVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
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
  own: {
    posts: Array<Post>;
    error: Error | null;
    loading: boolean;
    lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
  };
  tagged: {
    posts: Array<Post>;
    error: Error | null;
    loading: boolean;
    lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
  };
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
}

// export interface AuthState {
//   signin: {
//     email: string;
//     password: string;
//     loading: boolean;
//     error: Error | null;
//   };
//   signup: {
//     username: string;
//     email: string;
//     password: string;
//     retypePassword: string;
//     loading: boolean;
//     error: Error | null;
//   };
//   signout: {
//     loading: boolean;
//     error: Error | null;
//   };
//   loading: boolean;
//   update: {
//     loading: boolean;
//     error: Error | null;
//   };
//   user: User | null;
//   error: Error | null;
// }
