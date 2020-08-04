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
 * Method fetch posts of current user
 */
export const fetchOwnPosts = () => async (
  dispatch: (action: AuthAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchOwnPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { lastVisible } = getState().auth.own;
    let query: FirebaseFirestoreTypes.Query;
    if (!lastVisible) {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', user.id)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', user.id)
        .orderBy('date_posted', 'desc')
        .startAfter(lastVisible)
        .limit(postsPerBatch);
    }

    const documentSnapshots = await query.get();
    if (documentSnapshots.empty) {
      return dispatch(fetchOwnPostsSuccess([], lastVisible));
    }

    const preloadUser = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
    };
    const newPosts = await FSdocsToPostArray(
      documentSnapshots.docs,
      preloadUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchOwnPostsSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    dispatch(fetchOwnPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated: {
        return dispatch(fetchOwnPostsFailure(new Error(err.message)));
      }
      default:
        return dispatch(
          fetchOwnPostsFailure(new Error('Error occurred. Please try again.')),
        );
    }
  }
};

/**
 * Method refresh own posts when pulling the list down
 */
export const pullToFetchOwnPosts = () => async (
  dispatch: (action: AuthAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchOwnPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { lastVisible } = getState().auth.own;
    const documentSnapshots = await fsDB
      .collection('posts')
      .where('posted_by', '==', user.id)
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();
    if (documentSnapshots.empty) {
      return dispatch(fetchOwnPostsSuccess([], lastVisible));
    }

    const preloadUser = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
    };
    const newPosts = await FSdocsToPostArray(
      documentSnapshots.docs,
      preloadUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchOwnPostsSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    dispatch(pullToFetchOwnPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated: {
        return dispatch(pullToFetchOwnPostsFailure(new Error(err.message)));
      }
      default:
        return dispatch(
          pullToFetchOwnPostsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

/**
 * Method fetch tagged posts of current user
 */
export const fetchTaggedPosts = () => async (
  dispatch: (action: AuthAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchTaggedPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { lastVisible } = getState().auth.tagged;
    let query: FirebaseFirestoreTypes.Query;
    if (!lastVisible) {
      query = fsDB
        .collection('posts')
        .where('tagged_users', 'array-contains', user.id)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('tagged_users', 'array-contains', user.id)
        .orderBy('date_posted', 'desc')
        .startAfter(lastVisible)
        .limit(postsPerBatch);
    }

    const documentSnapshots = await query.get();
    if (documentSnapshots.empty) {
      return dispatch(fetchTaggedPostsSuccess([], lastVisible));
    }

    const newPosts = await FSdocsToPostArray(documentSnapshots.docs);

    if (newPosts.length === 0) {
      return dispatch(fetchTaggedPostsSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    dispatch(fetchTaggedPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated: {
        return dispatch(fetchTaggedPostsFailure(new Error(err.message)));
      }
      default:
        return dispatch(
          fetchTaggedPostsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

/**
 * Method refresh tagged posts when pulling the list down
 */
export const pullToFetchTaggedPosts = () => async (
  dispatch: (action: AuthAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchTaggedPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { lastVisible } = getState().auth.tagged;
    const documentSnapshots = await fsDB
      .collection('posts')
      .where('tagged_users', 'array-contains', user.id)
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();
    if (documentSnapshots.empty) {
      return dispatch(fetchTaggedPostsSuccess([], lastVisible));
    }

    const newPosts = await FSdocsToPostArray(documentSnapshots.docs);

    if (newPosts.length === 0) {
      return dispatch(fetchTaggedPostsSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    dispatch(pullToFetchTaggedPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated: {
        return dispatch(pullToFetchTaggedPostsFailure(new Error(err.message)));
      }
      default:
        return dispatch(
          pullToFetchTaggedPostsFailure(
            new Error('Error occurred. Please try again.'),
          ),
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

const fetchOwnPostsStarted = (): AuthAction => ({
  type: DispatchTypes.FETCH_USER_POSTS_STARTED,
  payload: null,
});

const fetchOwnPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): AuthAction => ({
  type: DispatchTypes.FETCH_USER_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchOwnPostsFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.FETCH_USER_POSTS_FAILURE,
  payload: error,
});

const pullToFetchOwnPostsStarted = (): AuthAction => ({
  type: DispatchTypes.PULL_TO_FETCH_USER_POSTS_STARTED,
  payload: null,
});

const pullToFetchOwnPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): AuthAction => ({
  type: DispatchTypes.PULL_TO_FETCH_USER_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchOwnPostsFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.PULL_TO_FETCH_USER_POSTS_FAILURE,
  payload: error,
});

const fetchTaggedPostsStarted = (): AuthAction => ({
  type: DispatchTypes.FETCH_USER_TAGGED_POSTS_STARTED,
  payload: null,
});

const fetchTaggedPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): AuthAction => ({
  type: DispatchTypes.FETCH_USER_TAGGED_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchTaggedPostsFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.FETCH_USER_TAGGED_POSTS_FAILURE,
  payload: error,
});

const pullToFetchTaggedPostsStarted = (): AuthAction => ({
  type: DispatchTypes.PULL_TO_FETCH_USER_TAGGED_POSTS_STARTED,
  payload: null,
});

const pullToFetchTaggedPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): AuthAction => ({
  type: DispatchTypes.PULL_TO_FETCH_USER_TAGGED_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchTaggedPostsFailure = (error: Error): AuthAction => ({
  type: DispatchTypes.PULL_TO_FETCH_USER_TAGGED_POSTS_FAILURE,
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

const editProfileEnd = (): AuthAction => ({
  type: DispatchTypes.EDIT_PROFILE_END,
  payload: null,
});

/* ---------------- end action dispatches --------------- */
