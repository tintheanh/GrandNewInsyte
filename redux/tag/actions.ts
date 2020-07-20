import {
  FETCH_USER_RESULTS_FAILURE,
  FETCH_USER_RESULTS_STARTED,
  FETCH_USER_RESULTS_SUCCESS,
  FETCH_USER_RESULTS_END,
  FETCH_NEW_USER_RESULTS_END,
  FETCH_NEW_USER_RESULTS_FAILURE,
  FETCH_NEW_USER_RESULTS_STARTED,
  FETCH_NEW_USER_RESULTS_SUCCESS,
  CLEAR,
  TagAction,
} from './types';
import { fsDB, FirebaseFirestoreTypes } from '../../config';
import { AppState } from '../store';

/* ------------------ post tag actions ------------------ */

export const fetchNewUserResults = (tagQuery: string) => async (
  dispatch: (action: TagAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      fetchNewUserResultsFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  dispatch(fetchNewUserResultsStarted());
  try {
    const uid = user.id;

    const userSnapshots = await fsDB
      .collection('users')
      .doc(uid)
      .collection('follower_for_search')
      .where('prefix', 'array-contains', tagQuery)
      .limit(5)
      .get();

    if (userSnapshots.empty) {
      console.log('new action end');
      return dispatch(fetchNewUserResultsEnd());
    }

    const users = [];
    for (const doc of userSnapshots.docs) {
      try {
        const userRef = await fsDB.collection('users').doc(doc.id).get();
        if (!userRef.exists) {
          continue;
        }
        const userData = userRef.data();
        const tagUser = {
          id: userRef.id,
          avatar: userData!.avatar,
          username: userData!.username,
          name: userData!.name,
        };
        users.push(tagUser);
      } catch (err) {
        continue;
      }
    }

    const newLastVisible = userSnapshots.docs[userSnapshots.docs.length - 1];
    dispatch(fetchNewUserResultsSuccess(users, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchUserResultsFailure(err));
  }
};

export const fetchUserResults = (tagQuery: string) => async (
  dispatch: (action: TagAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      fetchUserResultsFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  dispatch(fetchUserResultsStarted());
  try {
    const uid = user.id;
    const { lastVisible } = getState().tag.createPost;

    let userSnapshots: FirebaseFirestoreTypes.QuerySnapshot;
    if (lastVisible === null) {
      userSnapshots = await fsDB
        .collection('users')
        .doc(uid)
        .collection('follower_for_search')
        .where('prefix', 'array-contains', tagQuery)
        .limit(5)
        .get();
    } else {
      userSnapshots = await fsDB
        .collection('users')
        .doc(uid)
        .collection('follower_for_search')
        .startAfter(lastVisible)
        .where('prefix', 'array-contains', tagQuery)
        .limit(5)
        .get();
    }

    if (userSnapshots.empty) {
      return dispatch(fetchUserResultsEnd());
    }

    const users = [];
    for (const doc of userSnapshots.docs) {
      try {
        const userRef = await fsDB.collection('users').doc(doc.id).get();
        if (!userRef.exists) {
          continue;
        }
        const userData = userRef.data();
        const tagUser = {
          id: userRef.id,
          avatar: userData!.avatar,
          username: userData!.username,
          name: userData!.name,
        };
        users.push(tagUser);
      } catch (err) {
        continue;
      }
    }

    const newLastVisible = userSnapshots.docs[userSnapshots.docs.length - 1];
    dispatch(fetchUserResultsSuccess(users, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchUserResultsFailure(err));
  }
};

export const clear = () => async (dispatch: (action: TagAction) => void) => {
  dispatch({
    type: CLEAR,
    payload: null,
  });
};

/* ---------------- end post tag actions ---------------- */

/* ----------------- post tag dispatches ---------------- */

const fetchUserResultsStarted = (): TagAction => ({
  type: FETCH_USER_RESULTS_STARTED,
  payload: null,
});

const fetchUserResultsSuccess = (
  users: Array<{
    id: string;
    avatar: string;
    username: string;
    name: string;
  }>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): TagAction => ({
  type: FETCH_USER_RESULTS_SUCCESS,
  payload: { users, lastVisible },
});

const fetchUserResultsFailure = (error: Error): TagAction => ({
  type: FETCH_USER_RESULTS_FAILURE,
  payload: error,
});

const fetchUserResultsEnd = (): TagAction => ({
  type: FETCH_USER_RESULTS_END,
  payload: null,
});

const fetchNewUserResultsStarted = (): TagAction => ({
  type: FETCH_NEW_USER_RESULTS_STARTED,
  payload: null,
});

const fetchNewUserResultsSuccess = (
  users: Array<{
    id: string;
    avatar: string;
    username: string;
    name: string;
  }>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): TagAction => ({
  type: FETCH_NEW_USER_RESULTS_SUCCESS,
  payload: { users, lastVisible },
});

const fetchNewUserResultsFailure = (error: Error): TagAction => ({
  type: FETCH_NEW_USER_RESULTS_FAILURE,
  payload: error,
});

const fetchNewUserResultsEnd = (): TagAction => ({
  type: FETCH_NEW_USER_RESULTS_END,
  payload: null,
});

/* --------------- post tag dispatches end -------------- */
