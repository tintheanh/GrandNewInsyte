import {
  fireFuncs,
  fsDB,
  auth,
  fireStorage,
  HttpsCallableMethods,
  AuthErrorCodes,
  FirebaseFirestoreTypes,
  postsPerBatch,
} from '../../config';
import { DispatchTypes, AuthAction } from './types';
import { User, MyError, MyErrorCodes, Post } from '../../models';
import {
  isEmailValid,
  isPasswordValid,
  isUsernameValid,
  fetchMyself,
  delay,
  getCurrentUser,
  generateSubstringForUsername,
  FSdocsToPostArray,
} from '../../utils/functions';
import { AppState } from '../store';

/**
 * Method sign in
 * @param email
 * @param password
 */
export const signin = (email: string, password: string) => async (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch(signInStarted());
  try {
    if (!isEmailValid(email)) {
      throw new MyError('Email is invalid.', MyErrorCodes.EmailFailed);
    }

    if (!isPasswordValid(password)) {
      throw new MyError('Password is invalid.', MyErrorCodes.PasswordFailed);
    }

    const data = await auth.signInWithEmailAndPassword(email, password);
    const user = await fetchMyself(data.user.uid);

    // get email from signed in user
    user.email = data.user.email as string;

    dispatch(signInSuccess(user));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.EmailFailed:
      case MyErrorCodes.PasswordFailed:
        return dispatch(signInFailure(new Error(err.message)));
      case MyErrorCodes.DataNotFound: {
        // sign out when successfully sign in but couldn't fetch user data
        await auth.signOut();
        return dispatch(signInFailure(new Error(err.message)));
      }
      case AuthErrorCodes.UserNotFound: {
        return dispatch(signInFailure(new Error('User does not exist.')));
      }
      case AuthErrorCodes.WrongPassword: {
        return dispatch(
          signInFailure(new Error('Email or password is wrong.')),
        );
      }
      default:
        return dispatch(
          signInFailure(new Error('Error occurred. Please try again.')),
        );
    }
  }
};

/**
 * Method sign up with email and password
 * @param username
 * @param email
 * @param password
 * @param retypePassword
 */
export const signup = (
  username: string,
  email: string,
  password: string,
  retypePassword: string,
) => async (dispatch: (action: AuthAction) => void) => {
  dispatch(signUpStarted());
  try {
    if (!isUsernameValid(username)) {
      throw new MyError('Username is invalid.', MyErrorCodes.UsernameFailed);
    }

    if (!isEmailValid(email)) {
      throw new MyError('Email is invalid.', MyErrorCodes.EmailFailed);
    }

    if (!isPasswordValid(password)) {
      throw new MyError('Password is invalid.', MyErrorCodes.PasswordFailed);
    }

    if (password !== retypePassword) {
      throw new MyError(
        'Passwords do not match.',
        MyErrorCodes.PasswordsDontMatch,
      );
    }

    // check if username is already taken
    const checkUsername = fireFuncs.httpsCallable(
      HttpsCallableMethods.checkUsername,
    );
    await checkUsername({ username });

    const data = await auth.createUserWithEmailAndPassword(email, password);
    await data.user.updateProfile({
      displayName: username,
    });
    const user = {
      id: data.user.uid,
      avatar: '',
      name: '',
      email: data.user.email as string,
      username,
      bio: '',
      totalPosts: 0,
      following: 0,
      followers: 0,
    };

    dispatch(signUpSuccess(user));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.EmailFailed:
      case MyErrorCodes.PasswordFailed:
      case MyErrorCodes.UsernameFailed:
      case MyErrorCodes.PasswordsDontMatch:
      case AuthErrorCodes.UsernameAlreadyExists:
        return dispatch(signUpFailure(new Error(err.message)));
      case AuthErrorCodes.EmailAlreadyExists:
        return dispatch(signUpFailure(new Error('Email is already in use.')));
      default:
        return dispatch(
          signUpFailure(new Error('Error occurred. Please try again.')),
        );
    }
  }
};

export const clearSignUpError = () => async (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_SIGNUP_ERROR,
    payload: null,
  });
};

/**
 * Method check if user signed in
 */
export const checkAuth = () => async (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch(checkAuthStarted());
  try {
    const currentUser = await getCurrentUser();
    if (currentUser === null) {
      return dispatch(checkAuthSuccess(null));
    }

    const { uid, email } = currentUser;
    const user = await fetchMyself(uid);
    user.email = email as string;
    dispatch(checkAuthSuccess(user));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.DataNotFound: {
        await auth.signOut();
        return dispatch(checkAuthFailure(new Error(err.message)));
      }
      default:
        return dispatch(
          checkAuthFailure(new Error('Error occurred. Please try again.')),
        );
    }
  }
};

/**
 * Method sign out
 */
export const signout = () => async (dispatch: (action: AuthAction) => void) => {
  dispatch(signOutStarted());
  try {
    await auth.signOut();
    dispatch(signOutSuccess());
  } catch (err) {
    dispatch(signOutFailure(new Error('Error occurred. Please try again.')));
  }
};

/**
 * Method edit user's profile
 * @param avatar
 * @param name
 * @param bio
 */
export const editProfile = (
  avatar: string,
  name: string,
  bio: string,
) => async (
  dispatch: (action: AuthAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      editProfileFailure(new Error('Unauthenticated. Please sign in.')),
    );
  }

  const currentAvatar = getState().auth.user?.avatar;
  const currentName = getState().auth.user?.name;
  const currentBio = getState().auth.user?.bio;

  if (avatar === currentAvatar && name === currentName && bio === currentBio) {
    // do nothing if there's no changes in profile
    return;
  }
  dispatch(editProfileStarted());
  try {
    if (avatar !== currentAvatar) {
      // upload new avatar picture
      const imageRef = fireStorage.ref(`users/${user.id}/avatar`);
      await imageRef.putFile(avatar);

      // update new avatar to database
      const newAvatar = await imageRef.getDownloadURL();
      await fsDB.collection('users').doc(user.id).update({
        avatar: newAvatar,
        name,
        bio,
      });
      dispatch(editProfileSuccess({ avatar: newAvatar, name, bio }));
    } else {
      await fsDB.collection('users').doc(user.id).update({
        name,
        bio,
      });
      dispatch(editProfileSuccess({ avatar, name, bio }));
    }
  } catch (err) {
    dispatch(
      editProfileFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

/**
 * Method increase total posts when done creating a new post
 */
export const increaseTotalPostsByOne = () => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: DispatchTypes.INCREASE_TOTAL_POSTS_BY_ONE,
    payload: null,
  });
};

export const decreaseTotalPostsByOne = () => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: DispatchTypes.DECREASE_TOTAL_POSTS_BY_ONE,
    payload: null,
  });
};

export const increaseFollowingByOne = () => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: DispatchTypes.INCREASE_FOLLOWING_BY_ONE,
    payload: null,
  });
};

export const decreaseFollowingByOne = () => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: DispatchTypes.DECREASE_FOLLOWING_BY_ONE,
    payload: null,
  });
};

/* ------------------ action dispatches ------------------ */

const signInStarted = (): AuthAction => ({
  type: DispatchTypes.SIGN_IN_STARTED,
  payload: null,
});

const signInSuccess = (user: User): AuthAction => ({
  type: DispatchTypes.SIGN_IN_SUCCESS,
  payload: user,
});

const signInFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.SIGN_IN_FAILURE,
  payload: error,
});

const signUpStarted = (): AuthAction => ({
  type: DispatchTypes.SIGN_UP_STARTED,
  payload: null,
});

const signUpSuccess = (user: User): AuthAction => ({
  type: DispatchTypes.SIGN_UP_SUCCESS,
  payload: user,
});

const signUpFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.SIGN_UP_FAILURE,
  payload: error,
});

const signOutStarted = (): AuthAction => ({
  type: DispatchTypes.SIGN_OUT_STARTED,
  payload: null,
});

const signOutSuccess = (): AuthAction => ({
  type: DispatchTypes.SIGN_OUT_SUCCESS,
  payload: null,
});

const signOutFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.SIGN_OUT_FAILURE,
  payload: error,
});

const checkAuthStarted = (): AuthAction => ({
  type: DispatchTypes.CHECK_AUTH_STARTED,
  payload: null,
});

const checkAuthSuccess = (user: User | null): AuthAction => ({
  type: DispatchTypes.CHECK_AUTH_SUCCESS,
  payload: user,
});

const checkAuthFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.CHECK_AUTH_FAILURE,
  payload: error,
});

const editProfileStarted = (): AuthAction => ({
  type: DispatchTypes.EDIT_PROFILE_STARTED,
  payload: null,
});

const editProfileSuccess = ({
  avatar,
  name,
  bio,
}: {
  avatar: string;
  name: string;
  bio: string;
}): AuthAction => ({
  type: DispatchTypes.EDIT_PROFILE_SUCCESS,
  payload: {
    avatar,
    name,
    bio,
  },
});

const editProfileFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.EDIT_PROFILE_FAILURE,
  payload: error,
});

/* ---------------- end action dispatches --------------- */
