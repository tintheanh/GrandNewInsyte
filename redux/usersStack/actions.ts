import { DispatchTypes, UsersStackAction } from './types';
import { AppState } from '../store';
import { fsDB, userPostsPerBatch, FirebaseFirestoreTypes } from '../../config';
import { FSdocsToPostArray } from '../../utils/functions';
import { Post, CurrentTabScreen, MyError, MyErrorCodes } from '../../models';

export const pushUsersLayer = ({
  userID,
  username,
  avatar,
}: {
  userID: string;
  username: string;
  avatar: string;
}) => (dispatch: (action: UsersStackAction) => void) => {
  dispatch({
    type: DispatchTypes.PUSH_USERS_LAYER,
    payload: { userID, username, avatar },
  });
};

export const setCurrentViewableListIndex = (index: number) => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_VIEWABLE_POST_INDEX,
    payload: index,
  });
};

export const popUsersLayer = () => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.POP_USERS_LAYER,
    payload: null,
  });
};

export const setCurrentTabForUsersStack = (tab: CurrentTabScreen) => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_TAB,
    payload: tab,
  });
};

export const clearUsersStack = () => (
  dispatch: (action: UsersStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_STACK,
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
      throw new MyError('User not found.', MyErrorCodes.DataNotFound);
    }

    const userData = userRef.data();
    const completeUserLayer = {
      name: userData!.name,
      bio: userData!.bio,
      following: userData!.following,
      followers: userData!.followers,
      totalPosts: userData!.total_posts,
      isFollowed: false,
      lastVisible: null as FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
      posts: [] as Array<Post>,
    };

    // check if the current user follows the fetched user
    const myself = getState().auth.user;
    if (myself) {
      const followingRef = await fsDB
        .collection('users')
        .doc(myself.id)
        .collection('following_list')
        .doc(userID)
        .get();
      if (followingRef.exists) {
        completeUserLayer.isFollowed = true;
      }
    }

    // fetch user's posts
    let query: FirebaseFirestoreTypes.Query;
    if (completeUserLayer.isFollowed) {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', userID)
        .where('privacy', 'in', ['public', 'followers'])
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
      return dispatch(fetchUserSuccess(completeUserLayer));
    }

    const posts = await FSdocsToPostArray(documentSnapshots.docs);

    if (posts.length === 0) {
      return dispatch(fetchUserSuccess(completeUserLayer));
    }

    completeUserLayer.posts = posts;
    completeUserLayer.lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchUserSuccess(completeUserLayer));
  } catch (err) {
    console.log(err.message);
    switch (err.code) {
      case MyErrorCodes.DataNotFound:
        return dispatch(fetchUserFailure(new Error(err.message)));
      default:
        return dispatch(
          fetchUserFailure(new Error('Error occurred. Please try again.')),
        );
    }
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
        .where('privacy', 'in', ['public', 'followers'])
        .orderBy('date_posted', 'desc')
        .startAfter(lastVisible)
        .limit(userPostsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', userID)
        .where('privacy', '==', 'public')
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

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchMorePostsFromUserSuccess(posts, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(
      fetchMorePostsFromUserFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

export const followUser = (followingUserID: string) => async (
  dispatch: (action: UsersStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(followUserStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const myselfRef = fsDB.collection('users').doc(user.id);
    const userRef = fsDB.collection('users').doc(followingUserID);
    await fsDB.runTransaction(async (trans) => {
      // update myself's following number
      const myselfDoc = await trans.get(myselfRef);
      const newFollowing = myselfDoc.data()!.following + 1;
      trans.update(myselfRef, { following: newFollowing });
      const userDoc = await trans.get(userRef);

      // update user's followers number
      const newFollowers = userDoc.data()!.followers + 1;
      trans.update(userRef, { followers: newFollowers });

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
  type: DispatchTypes.FETCH_USER_STARTED,
  payload: null,
});

const fetchUserSuccess = (arg: any): UsersStackAction => ({
  type: DispatchTypes.FETCH_USER_SUCCESS,
  payload: arg,
});

const fetchUserFailure = (error: Error): UsersStackAction => ({
  type: DispatchTypes.FETCH_USER_FAILURE,
  payload: error,
});

const fetchMorePostsFromUserStarted = (): UsersStackAction => ({
  type: DispatchTypes.FETCH_MORE_POSTS_FROM_USER_STARTED,
  payload: null,
});

const fetchMorePostsFromUserSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): UsersStackAction => ({
  type: DispatchTypes.FETCH_MORE_POSTS_FROM_USER_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchMorePostsFromUserFailure = (error: Error): UsersStackAction => ({
  type: DispatchTypes.FETCH_MORE_POSTS_FROM_USER_FAILURE,
  payload: error,
});

const followUserStarted = (): UsersStackAction => ({
  type: DispatchTypes.FOLLOW_USER_STARTED,
  payload: null,
});

const followUserSuccess = (): UsersStackAction => ({
  type: DispatchTypes.FOLLOW_USER_SUCCESS,
  payload: null,
});

const followUserFailure = (error: Error): UsersStackAction => ({
  type: DispatchTypes.FOLLOW_USER_FAILURE,
  payload: error,
});

const unfollowUserStarted = (): UsersStackAction => ({
  type: DispatchTypes.UNFOLLOW_USER_STARTED,
  payload: null,
});

const unfollowUserSuccess = (): UsersStackAction => ({
  type: DispatchTypes.UNFOLLOW_USER_SUCCESS,
  payload: null,
});

const unfollowUserFailure = (error: Error): UsersStackAction => ({
  type: DispatchTypes.UNFOLLOW_USER_FAILURE,
  payload: error,
});

/* ----------------- end user dispatches ---------------- */
