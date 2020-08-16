import { DispatchTypes, TagAction } from './types';
import {
  userTagResultsPerBatch,
  fsDB,
  FirebaseFirestoreTypes,
} from '../../config';
import { UserResult, MyError, MyErrorCodes } from '../../models';
import { AppState } from '../store';

/* ------------------ post tag actions ------------------ */

export const fetchNewTagUserResults = (tagQuery: string) => async (
  dispatch: (action: TagAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchNewTagUserResultsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const uid = user.id;
    const documentSnapshots = await fsDB
      .collection('users')
      .doc(uid)
      .collection('follower_list')
      .where('for_search', 'array-contains', tagQuery)
      .orderBy('username')
      .limit(userTagResultsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchNewTagUserResultsSuccess([], null));
    }

    const userResults = [];
    for (const doc of documentSnapshots.docs) {
      const userRef = await fsDB.collection('users').doc(doc.id).get();
      if (!userRef.exists) {
        continue;
      }
      const data = userRef.data();
      userResults.push({
        id: doc.id,
        avatar: data!.avatar as string,
        username: data!.username as string,
        name: data!.name as string,
      });
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchNewTagUserResultsSuccess(userResults, newLastVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(fetchNewTagUserResultsFailure(new Error(err.message)));
      default:
        return dispatch(
          fetchNewTagUserResultsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

export const fetchMoreTagUserResults = (tagQuery: string) => async (
  dispatch: (action: TagAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchMoreTagUserResultsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const uid = user.id;
    const { lastVisible } = getState().tag.createPost;

    if (!lastVisible) {
      return dispatch(fetchMoreTagUserResultsSuccess([], null));
    }

    const documentSnapshots = await fsDB
      .collection('users')
      .doc(uid)
      .collection('follower_list')
      .where('for_search', 'array-contains', tagQuery)
      .orderBy('username')
      .startAfter(lastVisible)
      .limit(userTagResultsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchMoreTagUserResultsSuccess([], null));
    }

    const userResults = [];
    for (const doc of documentSnapshots.docs) {
      const userRef = await fsDB.collection('users').doc(doc.id).get();
      if (!userRef.exists) {
        continue;
      }
      const data = userRef.data();
      userResults.push({
        id: doc.id,
        avatar: data!.avatar as string,
        username: data!.username as string,
        name: data!.name as string,
      });
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    dispatch(fetchMoreTagUserResultsSuccess(userResults, newLastVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(fetchMoreTagUserResultsFailure(new Error(err.message)));
      default:
        return dispatch(
          fetchMoreTagUserResultsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

export const clearButKeepSelected = () => (
  dispatch: (action: TagAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_BUT_KEEP_SELECTED,
    payload: null,
  });
};

export const clearAll = () => (dispatch: (action: TagAction) => void) => {
  dispatch({
    type: DispatchTypes.CLEAR_ALL,
    payload: null,
  });
};

export const setSelectedUserResults = (uids: Array<string>) => (
  dispatch: (action: TagAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_SELECTED_USER_RESULTS,
    payload: uids,
  });
};

/* ---------------- end post tag actions ---------------- */

/* ----------------- post tag dispatches ---------------- */

const fetchMoreTagUserResultsStarted = (): TagAction => ({
  type: DispatchTypes.FETCH_MORE_TAG_USER_RESULTS_STARTED,
  payload: null,
});

const fetchMoreTagUserResultsSuccess = (
  users: Array<UserResult>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): TagAction => ({
  type: DispatchTypes.FETCH_MORE_TAG_USER_RESULTS_SUCCESS,
  payload: { users, lastVisible },
});

const fetchMoreTagUserResultsFailure = (error: Error): TagAction => ({
  type: DispatchTypes.FETCH_MORE_TAG_USER_RESULTS_FAILURE,
  payload: error,
});

const fetchNewTagUserResultsStarted = (): TagAction => ({
  type: DispatchTypes.FETCH_NEW_TAG_USER_RESULTS_STARTED,
  payload: null,
});

const fetchNewTagUserResultsSuccess = (
  users: Array<UserResult>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): TagAction => ({
  type: DispatchTypes.FETCH_NEW_TAG_USER_RESULTS_SUCCESS,
  payload: { users, lastVisible },
});

const fetchNewTagUserResultsFailure = (error: Error): TagAction => ({
  type: DispatchTypes.FETCH_NEW_TAG_USER_RESULTS_FAILURE,
  payload: error,
});

/* --------------- post tag dispatches end -------------- */
