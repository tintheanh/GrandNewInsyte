import {
  POP_USERS_LAYER,
  PUSH_USERS_LAYER,
  SET_CURRENT_TAB,
  FETCH_USER_FAILURE,
  FETCH_USER_STARTED,
  FETCH_USER_SUCCESS,
  SET_CURRENT_VIEWABLE_POST_INDEX,
  FETCH_MORE_POSTS_FROM_USER_FAILURE,
  FETCH_MORE_POSTS_FROM_USER_STARTED,
  FETCH_MORE_POSTS_FROM_USER_SUCCESS,
  FOLLOW_USER_FAILURE,
  FOLLOW_USER_STARTED,
  FOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAILURE,
  UNFOLLOW_USER_STARTED,
  UNFOLLOW_USER_SUCCESS,
  CLEAR_STACK,
  UsersStackAction,
  CurrentTab,
} from './types';
import { AppState } from '../store';
import { fsDB, userPostsPerBatch, FirebaseFirestoreTypes } from '../../config';
import {
  FSdocsToPostArray,
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

export const setCurrentViewableListIndex = (index: number) => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: SET_CURRENT_VIEWABLE_POST_INDEX,
    payload: index,
  });
};

export const popUsersLayer = () => (
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

export const clearUsersStack = () => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: CLEAR_STACK,
    payload: null,
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
      lastVisible: null as FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
      posts: [] as Array<Post>,
    };
    const myself = getState().auth.user;
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
        .where('posted_by', '==', userID)
        .orderBy('date_posted', 'desc')
        .limit(userPostsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('privacy', '==', 'public')
        .where('posted_by', '==', userID)
        .orderBy('date_posted', 'desc')
        .limit(userPostsPerBatch);
    }
    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchUserSuccess(userLayer));
    }

    const posts = await FSdocsToPostArray(documentSnapshots.docs);

    if (posts.length === 0) {
      return dispatch(fetchUserSuccess(userLayer));
    }

    const filterPrivate = posts.filter((post) => post.privacy !== 'private');

    // filterPrivate.sort((b, a) => a.datePosted - b.datePosted);

    // const removedDuplicates = removeDuplicatesFromArray(filterPrivate);

    userLayer.posts = filterPrivate;
    userLayer.lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchUserSuccess(userLayer));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchUserFailure(err));
  }
};

export const fetchMorePostsFromUser = (
  userID: string,
  isFollowed: boolean,
) => async (
  dispatch: (action: UsersStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchMorePostsFromUserStarted());
  try {
    const { currentTab } = getState().usersStack;
    const lastVisible = getState().usersStack[currentTab].top()?.lastVisible;
    if (lastVisible === undefined) {
      throw new Error('Error occurred.');
    }
    let query: FirebaseFirestoreTypes.Query;
    if (isFollowed) {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', userID)
        .orderBy('date_posted', 'desc')
        .startAfter(lastVisible)
        .limit(userPostsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('privacy', '==', 'public')
        .where('posted_by', '==', userID)
        .orderBy('date_posted', 'desc')
        .startAfter(lastVisible)
        .limit(userPostsPerBatch);
    }
    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchMorePostsFromUserSuccess([], lastVisible));
    }

    const posts = await FSdocsToPostArray(documentSnapshots.docs);

    if (posts.length === 0) {
      return dispatch(fetchMorePostsFromUserSuccess([], lastVisible));
    }

    const filterPrivate = posts.filter((post) => post.privacy !== 'private');

    // filterPrivate.sort((b, a) => a.datePosted - b.datePosted);

    // const removedDuplicates = removeDuplicatesFromArray(filterPrivate);

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchMorePostsFromUserSuccess(filterPrivate, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchMorePostsFromUserFailure(err));
  }
};

export const followUser = (followingUserID: string) => async (
  dispatch: (action: UsersStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      followUserFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  dispatch(followUserStarted());
  try {
    const myselfRef = fsDB.collection('users').doc(user.id);
    const userRef = fsDB.collection('users').doc(followingUserID);
    await fsDB.runTransaction(async (trans) => {
      const myselfDoc = await trans.get(myselfRef);
      const newFollowing = myselfDoc.data()!.following + 1;
      trans.update(myselfRef, { following: newFollowing });
      const userDoc = await trans.get(userRef);
      const newFollowers = userDoc.data()!.followers + 1;
      trans.update(userRef, { followers: newFollowers });
      // throw new Error('dummy');
      const followingRef = fsDB
        .collection('users')
        .doc(user.id)
        .collection('following_list')
        .doc(followingUserID);
      const following = await followingRef.get();
      if (following.exists) {
        throw new Error('Invalid operation.');
      }
      trans.set(followingRef, { c: 1 });
    });
    dispatch(followUserSuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(followUserFailure(err));
  }
};

export const unfollowUser = (followingUserID: string) => async (
  dispatch: (action: UsersStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      unfollowUserFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  dispatch(unfollowUserStarted());
  try {
    const myselfRef = fsDB.collection('users').doc(user.id);
    const userRef = fsDB.collection('users').doc(followingUserID);
    await fsDB.runTransaction(async (trans) => {
      const myselfDoc = await trans.get(myselfRef);
      const newFollowing = myselfDoc.data()!.following - 1;
      trans.update(myselfRef, { following: newFollowing });
      const userDoc = await trans.get(userRef);
      const newFollowers = userDoc.data()!.followers - 1;
      trans.update(userRef, { followers: newFollowers });
      // throw new Error('dummy');
      const followingRef = fsDB
        .collection('users')
        .doc(user.id)
        .collection('following_list')
        .doc(followingUserID);
      trans.delete(followingRef);
    });
    dispatch(unfollowUserSuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(unfollowUserFailure(err));
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

const fetchMorePostsFromUserStarted = (): UsersStackAction => ({
  type: FETCH_MORE_POSTS_FROM_USER_STARTED,
  payload: null,
});

const fetchMorePostsFromUserSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): UsersStackAction => ({
  type: FETCH_MORE_POSTS_FROM_USER_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchMorePostsFromUserFailure = (error: Error): UsersStackAction => ({
  type: FETCH_MORE_POSTS_FROM_USER_FAILURE,
  payload: error,
});

const followUserStarted = (): UsersStackAction => ({
  type: FOLLOW_USER_STARTED,
  payload: null,
});

const followUserSuccess = (): UsersStackAction => ({
  type: FOLLOW_USER_SUCCESS,
  payload: null,
});

const followUserFailure = (error: Error): UsersStackAction => ({
  type: FOLLOW_USER_FAILURE,
  payload: error,
});

const unfollowUserStarted = (): UsersStackAction => ({
  type: UNFOLLOW_USER_STARTED,
  payload: null,
});

const unfollowUserSuccess = (): UsersStackAction => ({
  type: UNFOLLOW_USER_SUCCESS,
  payload: null,
});

const unfollowUserFailure = (error: Error): UsersStackAction => ({
  type: UNFOLLOW_USER_FAILURE,
  payload: error,
});

/* ----------------- end user dispatches ---------------- */
