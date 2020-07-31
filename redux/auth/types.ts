import { User } from '../../models';

export const SIGN_IN_STARTED = 'SIGN_IN_STARTED';
export const SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS';
export const SIGN_IN_FAILURE = 'SIGN_IN_FAILURE';

export const SIGN_UP_STARTED = 'SIGN_UP_STARTED';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';

export const SIGN_OUT_STARTED = 'SIGN_OUT_STARTED';
export const SIGN_OUT_SUCCESS = 'SIGN_OUT_SUCCESS';
export const SIGN_OUT_FAILURE = 'SIGN_OUT_FAILURE';

export const ON_SIGNIN_EMAIL_CHANGE = 'ON_SIGNIN_EMAIL_CHANGE';
export const ON_SIGNIN_PASSWORD_CHANGE = 'ON_SIGNIN_PASSWORD_CHANGE';

export const ON_SIGNUP_EMAIL_CHANGE = 'ON_SIGNUP_EMAIL_CHANGE';
export const ON_SIGNUP_PASSWORD_CHANGE = 'ON_SIGNUP_PASSWORD_CHANGE';

export const ON_USERNAME_CHANGE = 'ON_USERNAME_CHANGE';
export const ON_RETYPE_PASSWORD_CHANGE = 'ON_RETYPE_PASSWORD_CHANGE';

export const CHECK_AUTH_STARTED = 'CHECK_AUTH_STARTED';
export const CHECK_AUTH_SUCCESS = 'CHECK_AUTH_SUCCESS';
export const CHECK_AUTH_FAILURE = 'CHECK_AUTH_FAILURE';

export const EDIT_PROFILE_STARTED = 'EDIT_PROFILE_STARTED';
export const EDIT_PROFILE_SUCCESS = 'EDIT_PROFILE_SUCCESS';
export const EDIT_PROFILE_FAILURE = 'EDIT_PROFILE_FAILURE';
export const EDIT_PROFILE_END = 'EDIT_PROFILE_END';

export const INCREASE_TOTAL_POSTS_BY_ONE = 'INCREASE_TOTAL_POSTS_BY_ONE';
export const DECREASE_TOTAL_POSTS_BY_ONE = 'DECREASE_TOTAL_POSTS_BY_ONE';

export const INCREASE_FOLLOWING_BY_ONE = 'INCREASE_FOLLOWING_BY_ONE';
export const DECREASE_FOLLOWING_BY_ONE = 'DECREASE_FOLLOWING_BY_ONE';

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
    | Array<any>
    | null;
}

export interface AuthState {
  signin: {
    email: string;
    password: string;
    loading: boolean;
    error: Error | null;
  };
  signup: {
    username: string;
    email: string;
    password: string;
    retypePassword: string;
    loading: boolean;
    error: Error | null;
  };
  signout: {
    loading: boolean;
    error: Error | null;
  };
  loading: boolean;
  update: {
    loading: boolean;
    error: Error | null;
  };
  user: User | null | undefined;
  error: Error | null;
}
