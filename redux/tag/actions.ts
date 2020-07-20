import {
  CREATE_POST_TAG_FAILURE,
  CREATE_POST_TAG_STARTED,
  CREATE_POST_TAG_SUCCESS,
  CREATE_POST_TAG_END,
  CREATE_POST_TAG_NEW_END,
  CREATE_POST_TAG_NEW_FAILURE,
  CREATE_POST_TAG_NEW_STARTED,
  CREATE_POST_TAG_NEW_SUCCESS,
  CLEAR,
  TagAction,
} from './types';
import { fsDB, FirebaseFirestoreTypes } from '../../config';
import { AppState } from '../store';

/* ------------------ post tag actions ------------------ */

export const createPostTagNew = (tagQuery: string) => async (
  dispatch: (action: TagAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      createPostTagNewFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  dispatch(createPostTagNewStarted());
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
      return dispatch(createPostTagNewEnd());
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
    dispatch(createPostTagNewSuccess(users, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(createPostTagFailure(err));
  }
};

export const createPostTag = (tagQuery: string) => async (
  dispatch: (action: TagAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      createPostTagFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  dispatch(createPostTagStarted());
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
      return dispatch(createPostTagEnd());
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
    dispatch(createPostTagSuccess(users, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(createPostTagFailure(err));
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

const createPostTagStarted = (): TagAction => ({
  type: CREATE_POST_TAG_STARTED,
  payload: null,
});

const createPostTagSuccess = (
  users: Array<{
    id: string;
    avatar: string;
    username: string;
    name: string;
  }>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): TagAction => ({
  type: CREATE_POST_TAG_SUCCESS,
  payload: { users, lastVisible },
});

const createPostTagFailure = (error: Error): TagAction => ({
  type: CREATE_POST_TAG_FAILURE,
  payload: error,
});

const createPostTagEnd = (): TagAction => ({
  type: CREATE_POST_TAG_END,
  payload: null,
});

const createPostTagNewStarted = (): TagAction => ({
  type: CREATE_POST_TAG_NEW_STARTED,
  payload: null,
});

const createPostTagNewSuccess = (
  users: Array<{
    id: string;
    avatar: string;
    username: string;
    name: string;
  }>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): TagAction => ({
  type: CREATE_POST_TAG_NEW_SUCCESS,
  payload: { users, lastVisible },
});

const createPostTagNewFailure = (error: Error): TagAction => ({
  type: CREATE_POST_TAG_NEW_FAILURE,
  payload: error,
});

const createPostTagNewEnd = (): TagAction => ({
  type: CREATE_POST_TAG_NEW_END,
  payload: null,
});

/* --------------- post tag dispatches end -------------- */
