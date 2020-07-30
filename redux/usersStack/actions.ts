import {
  POP_USERS_LAYER,
  PUSH_USERS_LAYER,
  SET_CURRENT_TAB,
  FETCH_USER_FAILURE,
  FETCH_USER_STARTED,
  FETCH_USER_SUCCESS,
  UsersStackAction,
  CurrentTab,
} from './types';
import { AppState } from '../store';
import { fsDB, userPostsPerBatch, FirebaseFirestoreTypes } from '../../config';
import {
  docFStoPostArray,
  removeDuplicatesFromArray,
} from '../../utils/functions';
import { Post } from '../../models';

export const pushUsersLayer = ({
  id,
  username,
  avatar,
}: {
  id: string;
  username: string;
  avatar: string;
}) => (dispatch: (action: UsersStackAction) => void) => {
  dispatch({
    type: PUSH_USERS_LAYER,
    payload: { id, username, avatar },
  });
};

export const popRepliesLayer = () => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: POP_USERS_LAYER,
    payload: null,
  });
};

export const setCurrentTabForUsersStack = (tab: CurrentTab) => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: SET_CURRENT_TAB,
    payload: tab,
  });
};

export const fetchUser = (userID: string) => async (
  dispatch: (action: UsersStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchUserStarted());
  try {
    const userRef = await fsDB.collection('users').doc(userID).get();
    if (!userRef.exists) {
      return dispatch(fetchUserFailure(new Error('User not found.')));
    }
    const userData = userRef.data();
    const userLayer = {
      name: userData!.name,
      bio: userData!.bio,
      following: userData!.following,
      followers: userData!.followers,
      totalPosts: userData!.total_posts,
      isFollowed: false,
      lastVisible: 0,
      posts: [] as Array<Post>,
    };
    const myself = getState().auth.user;
    const { currentTab } = getState().usersStack;
    const currentLastVisible = getState().usersStack[currentTab].top()
      ?.lastVisible;
    if (myself) {
      const followingRef = await fsDB
        .collection('users')
        .doc(myself.id)
        .collection('following_list')
        .doc(userID)
        .get();
      if (followingRef.exists) {
        userLayer.isFollowed = true;
      }
    }
    let query: FirebaseFirestoreTypes.Query;
    if (userLayer.isFollowed) {
      query = fsDB
        .collection('posts')
        .where('date_posted', '<=', currentLastVisible)
        .where('privacy', '<', 'private')
        .where('privacy', '>', 'private')
        .orderBy('date_posted', 'desc')
        .limit(userPostsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('privacy', '==', 'public')
        .orderBy('date_posted', 'desc')
        .limit(userPostsPerBatch);
    }
    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchUserSuccess(userLayer));
    }

    const posts = await docFStoPostArray(documentSnapshots.docs);

    if (posts.length === 0) {
      return dispatch(fetchUserSuccess(userLayer));
    }

    posts.sort((b, a) => a.datePosted - b.datePosted);

    const removedDuplicates = removeDuplicatesFromArray(posts);

    userLayer.posts = removedDuplicates;
    userLayer.lastVisible =
      removedDuplicates[removedDuplicates.length - 1].datePosted;
    dispatch(fetchUserSuccess(userLayer));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchUserFailure(err));
  }
};

/* ------------------- user dispatches ------------------ */

const fetchUserStarted = (): UsersStackAction => ({
  type: FETCH_USER_STARTED,
  payload: null,
});

const fetchUserSuccess = (arg: any): UsersStackAction => ({
  type: FETCH_USER_SUCCESS,
  payload: arg,
});

const fetchUserFailure = (error: Error): UsersStackAction => ({
  type: FETCH_USER_FAILURE,
  payload: error,
});

/* ----------------- end user dispatches ---------------- */
