import { fireFuncs, fsDB, auth, fireStorage } from '../../config/firebase';
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
  ON_SIGNIN_EMAIL_CHANGE,
  ON_SIGNIN_PASSWORD_CHANGE,
  ON_SIGNUP_EMAIL_CHANGE,
  ON_SIGNUP_PASSWORD_CHANGE,
  ON_USERNAME_CHANGE,
  ON_RETYPE_PASSWORD_CHANGE,
  CHECK_AUTH_STARTED,
  CHECK_AUTH_SUCCESS,
  CHECK_AUTH_FAILURE,
  EDIT_PROFILE_FAILURE,
  EDIT_PROFILE_END,
  EDIT_PROFILE_STARTED,
  EDIT_PROFILE_SUCCESS,
  INCREASE_TOTAL_POSTS_BY_ONE,
  DECREASE_TOTAL_POSTS_BY_ONE,
} from './types';
import { User } from '../../models';
import {
  emailValidate,
  passwordValidate,
  fetchUser,
  // delay,
  getCurrentUser,
} from '../../utils/functions';
import { AppState } from '../store';

// const signInPersistence = (email: string, password: string) => {
//   return auth.signInWithEmailAndPassword(email, password);
// };

// export const signUpPersistence = (email: string, password: string) => {
//   return firebase
//     .auth()
//     .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
//     .then(() => {
//       return firebase.auth().createUserWithEmailAndPassword(email, password);
//     })
//     .catch((err) => {
//       throw err;
//     });
// };

/* ----------------- set-value methods ----------------- */

export const setSignInEmail = (email: string) => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: ON_SIGNIN_EMAIL_CHANGE,
    payload: email,
  });
};

export const setSignInPassword = (password: string) => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: ON_SIGNIN_PASSWORD_CHANGE,
    payload: password,
  });
};

export const setSignUpEmail = (email: string) => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: ON_SIGNUP_EMAIL_CHANGE,
    payload: email,
  });
};

export const setSignUpPassword = (password: string) => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: ON_SIGNUP_PASSWORD_CHANGE,
    payload: password,
  });
};

export const setUsername = (username: string) => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: ON_USERNAME_CHANGE,
    payload: username,
  });
};

export const setRetypePassword = (retypePassword: string) => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: ON_RETYPE_PASSWORD_CHANGE,
    payload: retypePassword,
  });
};

/* ---------------- end set-value methods --------------- */

export const signin = (email: string, password: string) => async (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch(signInStarted());

  try {
    /* ---------------------- validate ---------------------- */

    let erMsg = emailValidate(email);
    if (erMsg !== '') {
      const err = new Error(erMsg);
      (err as any).code = 'my-custom-error/email-failed';
      throw err;
    }
    erMsg = passwordValidate(password);
    if (erMsg !== '') {
      const err = new Error(erMsg);
      (err as any).code = 'my-custom-error/password-failed';
      throw err;
    }

    /* -------------------- end validate -------------------- */

    /* ----------------------- sign in ---------------------- */

    let data;
    try {
      data = await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      throw err;
    }

    const uid = data.user?.uid as string;
    try {
      const user = await fetchUser(uid);
      user.email = data.user?.email as string;
      dispatch(signInSuccess(user));
    } catch (err) {
      if (err.code === 'my-custom-error/firestore-off') {
        console.log(err.message);
        try {
          await auth.signOut();
        } catch (error) {}
        throw err;
      }
      // const deleteUser = fireFuncs.httpsCallable('deleteUser');
      try {
        // await deleteUser({ uid: err.idNotFound });
      } catch (error) {}
      throw err;
    }

    /* --------------------- end sign in -------------------- */
  } catch (err) {
    /* -------------------- handle errors ------------------- */

    switch (err.code) {
      case 'my-custom-error/email-failed':
      case 'my-custom-error/password-failed':
        return dispatch(signInFailure(new Error(err.message)));
      case 'auth/wrong-password':
        return dispatch(signInFailure(new Error('Wrong password.')));
      case 'auth/user-not-found':
        return dispatch(
          signInFailure(new Error('Email has not been registered.')),
        );
      case 'auth/invalid-email':
        return dispatch(signInFailure(new Error('Email is invalid.')));
      case 'auth/invalid-password':
        return dispatch(
          signInFailure(new Error('Password must be at least 6 characters.')),
        );
      case 'auth/internal-error':
        return dispatch(signInFailure(new Error('Internal server error.')));
      case 'my-custom-error/firestore-off':
        return dispatch(signInFailure(new Error('Internal server error.')));
      case 'my-custom-error/user-not-found':
        return dispatch(signInFailure(new Error(err.message)));
      default:
        return dispatch(signInFailure(new Error('Unknown error occured.')));
    }

    /* ------------------ end handle errors ----------------- */
  }
};

export const signup = (
  username: string,
  email: string,
  password: string,
  retypePassword: string,
) => async (dispatch: (action: AuthAction) => void) => {
  dispatch(signUpStarted());
  try {
    /* ---------------------- validate ---------------------- */

    if (username.length < 4) {
      const err = new Error('Username must be at least 4 characters.');
      (err as any).code = 'my-custom-error/username-failed';
      throw err;
    }
    const checkUsername = fireFuncs.httpsCallable('checkUsername');
    await checkUsername({ username });

    let errMsg = emailValidate(email);
    if (errMsg !== '') {
      const err = new Error(errMsg);
      (err as any).code = 'my-custom-error/email-failed';
      throw err;
    }
    errMsg = passwordValidate(password);
    if (errMsg !== '') {
      const err = new Error(errMsg);
      (err as any).code = 'my-custom-error/password-failed';
      throw err;
    }
    if (password !== retypePassword) {
      const err = new Error(errMsg);
      (err as any).code = 'my-custom-error/retype-password-failed';
      throw err;
    }

    /* -------------------- end validate -------------------- */

    /* ----------------------- sign up ---------------------- */

    let userToDb = null;
    try {
      const data = await auth.createUserWithEmailAndPassword(email, password);
      userToDb = {
        id: data.user?.uid as string,
        avatar: '',
        name: '', // TODO add name when sign up
        email: data.user?.email as string,
        username: username,
        bio: '',
        totalPosts: 0,
      };
    } catch (err) {
      throw err;
    }

    /* --------------------- end sign up -------------------- */

    /* ------------------- add user to fsDB ------------------- */

    try {
      await fsDB.collection('users').doc(userToDb.id).set({ username });
      const user: User = {
        ...userToDb,
        followers: 0,
        following: 0,
      };
      dispatch(signUpSuccess(user));
    } catch (err) {
      // clear up user if errors occured in fsDB
      const deleteUser = fireFuncs.httpsCallable('deleteUser');
      await deleteUser({ uid: userToDb.id });
      throw err;
    }

    /* ----------------- end add user to fsDB ----------------- */
  } catch (err) {
    /* -------------------- handle errors ------------------- */

    switch (err.code) {
      case 'my-custom-error/username-failed':
      case 'my-custom-error/email-failed':
      case 'my-custom-error/password-failed':
      case 'my-custom-error/retype-password-failed':
      case 'already-exists':
        return dispatch(signUpFailure(new Error(err.message)));
      case 'auth/email-already-in-use':
        return dispatch(signUpFailure(new Error('Email is already in use.')));
      case 'auth/invalid-email':
        return dispatch(signUpFailure(new Error('Email is invalid.')));
      case 'auth/invalid-password':
        return dispatch(
          signUpFailure(new Error('Password must be at least 6 characters.')),
        );
      case 'auth/internal-error':
        return dispatch(signUpFailure(new Error('Internal server error.')));
      default:
        return dispatch(signUpFailure(new Error('Unknown error occured.')));
    }

    /* ------------------ end handle errors ----------------- */
  }
};

export const checkAuth = () => async (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch(checkAuthStarted());
  try {
    // await delay(2000);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return dispatch(checkAuthSuccess(null));
    }

    const { uid, email } = currentUser;

    try {
      const user = await fetchUser(uid);
      user.email = email as string;
      dispatch(signInSuccess(user));
    } catch (err) {
      if (err.code === 'my-custom-error/firestore-off') {
        try {
          await auth.signOut();
        } catch (error) {}
        throw new Error('Internal server error.');
      }
      // const deleteUser = fireFuncs.httpsCallable('deleteUser');
      // try {
      //   await deleteUser({ uid: err.idNotFound });
      // } catch (error) {}
      throw new Error('User not found.');
    }
  } catch (err) {
    dispatch(checkAuthFailure(new Error(err.message)));
  }
};

export const signout = () => async (dispatch: (action: AuthAction) => void) => {
  dispatch(signOutStarted());
  try {
    await auth.signOut();
    dispatch(signOutSuccess());
  } catch (err) {
    dispatch(signOutFailure(err));
  }
};

export const editProfile = (
  avatar: string,
  name: string,
  bio: string,
  callback: () => void,
) => async (
  dispatch: (action: AuthAction) => void,
  getState: () => AppState,
) => {
  dispatch(editProfileStarted());
  try {
    // await delay(1000);
    const currentAvatar = getState().auth.user?.avatar;
    const currentName = getState().auth.user?.name;
    const currentBio = getState().auth.user?.bio;

    if (
      avatar === currentAvatar &&
      name === currentName &&
      bio === currentBio
    ) {
      callback();
      return dispatch(editProfileEnd());
    }

    const uid = getState().auth.user?.id;

    if (avatar !== currentAvatar) {
      const imageRef = fireStorage.ref(`users/${uid}/avatar`);

      await imageRef.putFile(avatar);

      const newAvatar = await imageRef.getDownloadURL();
      await fsDB.collection('users').doc(uid).update({
        avatar: newAvatar,
        name,
        bio,
      });
      dispatch(editProfileSuccess({ avatar: newAvatar, name, bio }));
    } else {
      await fsDB.collection('users').doc(uid).update({
        name,
        bio,
      });
      dispatch(editProfileSuccess({ avatar, name, bio }));
    }
    callback();
  } catch (err) {
    console.log(err.message);
    dispatch(editProfileFailure(new Error('Error occured. Please try again!')));
  }
};

export const increaseTotalPostsByOne = () => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: INCREASE_TOTAL_POSTS_BY_ONE,
    payload: null,
  });
};

export const decreaseTotalPostsByOne = () => (
  dispatch: (action: AuthAction) => void,
) => {
  dispatch({
    type: DECREASE_TOTAL_POSTS_BY_ONE,
    payload: null,
  });
};

/* ------------------ action dispatches ------------------ */

const signInStarted = (): AuthAction => ({
  type: SIGN_IN_STARTED,
  payload: null,
});

const signInSuccess = (user: User): AuthAction => ({
  type: SIGN_IN_SUCCESS,
  payload: user,
});

const signInFailure = (error: Error): AuthAction => ({
  type: SIGN_IN_FAILURE,
  payload: error,
});

const signUpStarted = (): AuthAction => ({
  type: SIGN_UP_STARTED,
  payload: null,
});

const signUpSuccess = (user: User): AuthAction => ({
  type: SIGN_UP_SUCCESS,
  payload: user,
});

const signUpFailure = (error: Error): AuthAction => ({
  type: SIGN_UP_FAILURE,
  payload: error,
});

const signOutStarted = (): AuthAction => ({
  type: SIGN_OUT_STARTED,
  payload: null,
});

const signOutSuccess = (): AuthAction => ({
  type: SIGN_OUT_SUCCESS,
  payload: null,
});

const signOutFailure = (error: Error): AuthAction => ({
  type: SIGN_OUT_FAILURE,
  payload: error,
});

const checkAuthStarted = (): AuthAction => ({
  type: CHECK_AUTH_STARTED,
  payload: null,
});

const checkAuthSuccess = (user: User | null): AuthAction => ({
  type: CHECK_AUTH_SUCCESS,
  payload: user,
});

const checkAuthFailure = (error: Error): AuthAction => ({
  type: CHECK_AUTH_FAILURE,
  payload: error,
});

const editProfileStarted = (): AuthAction => ({
  type: EDIT_PROFILE_STARTED,
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
  type: EDIT_PROFILE_SUCCESS,
  payload: {
    avatar,
    name,
    bio,
  },
});

const editProfileFailure = (error: Error): AuthAction => ({
  type: EDIT_PROFILE_FAILURE,
  payload: error,
});

const editProfileEnd = (): AuthAction => ({
  type: EDIT_PROFILE_END,
  payload: null,
});

/* ---------------- end action dispatches --------------- */
