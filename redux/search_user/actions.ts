import { DispatchTypes, SearchUserAction } from './types';
import {
  fsDB,
  FirebaseFirestoreTypes,
  userResultsPerBatch,
} from '../../config';
import { UserResult } from '../../models';
import { AppState } from '../store';

export const clearSearchUser = () => (
  dispatch: (action: SearchUserAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_SEARCH_USER,
    payload: null,
  });
};

/* --------------- fetch new users actions -------------- */

export const fetchNewUserResults = (searchQuery: string) => async (
  dispatch: (action: SearchUserAction) => void,
) => {
  dispatch(fetchNewUserResultsStarted());
  try {
    const documentSnapshots = await fsDB
      .collection('users')
      .where('for_search', 'array-contains', searchQuery)
      .orderBy('username')
      .limit(userResultsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchNewUserResultsSuccess([], null));
    }

    const userResults = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        avatar: data.avatar as string,
        username: data.username as string,
        name: data.name as string,
      };
    });

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    dispatch(fetchNewUserResultsSuccess(userResults, newLastVisible));
  } catch (err) {
    dispatch(
      fetchNewUserResultsFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

export const fetchMoreUserResults = (searchQuery: string) => async (
  dispatch: (action: SearchUserAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchMoreUserResultsStarted());
  try {
    const { lastVisible } = getState().searchUser;

    if (!lastVisible) {
      return dispatch(fetchMoreUserResultsSuccess([], null));
    }

    const documentSnapshots = await fsDB
      .collection('users')
      .where('for_search', 'array-contains', searchQuery)
      .orderBy('username')
      .startAfter(lastVisible)
      .limit(userResultsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchMoreUserResultsSuccess([], null));
    }

    const userResults = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        avatar: data.avatar as string,
        username: data.username as string,
        name: data.name as string,
      };
    });

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    dispatch(fetchMoreUserResultsSuccess(userResults, newLastVisible));
  } catch (err) {
    dispatch(
      fetchMoreUserResultsFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

/* ------------- end fetch new users actions ------------ */

/* --------------- search user dispatches --------------- */

const fetchNewUserResultsStarted = (): SearchUserAction => ({
  type: DispatchTypes.FETCH_NEW_USER_RESULTS_STARTED,
  payload: null,
});

const fetchNewUserResultsSuccess = (
  results: Array<UserResult>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): SearchUserAction => ({
  type: DispatchTypes.FETCH_NEW_USER_RESULTS_SUCCESS,
  payload: { results, lastVisible },
});

const fetchNewUserResultsFailure = (error: any): SearchUserAction => ({
  type: DispatchTypes.FETCH_NEW_USER_RESULTS_FAILURE,
  payload: error,
});

const fetchMoreUserResultsStarted = (): SearchUserAction => ({
  type: DispatchTypes.FETCH_MORE_USER_RESULTS_STARTED,
  payload: null,
});

const fetchMoreUserResultsSuccess = (
  results: Array<UserResult>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): SearchUserAction => ({
  type: DispatchTypes.FETCH_MORE_USER_RESULTS_SUCCESS,
  payload: { results, lastVisible },
});

const fetchMoreUserResultsFailure = (error: Error): SearchUserAction => ({
  type: DispatchTypes.FETCH_MORE_USER_RESULTS_FAILURE,
  payload: error,
});

/* ------------- end search user dispatches ------------- */
