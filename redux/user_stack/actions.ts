import { DispatchTypes, UserStackAction } from './types';
import { AppState } from '../store';
import { fsDB, userPostsPerBatch, FirebaseFirestoreTypes } from '../../config';
import { FSdocsToPostArray } from '../../utils/functions';
import { Post, CurrentTabScreen, MyError, MyErrorCodes } from '../../models';

/* --------------------- ultilities --------------------- */

/**
 * Method push new user layer before navigating to a new user screen
 * @param newUserLayer New user layer to push
 */
export const pushUserLayer = ({
  userID,
  username,
  avatar,
}: {
  userID: string;
  username: string;
  avatar: string;
}) => (dispatch: (action: UserStackAction) => void) => {
  dispatch({
    type: DispatchTypes.PUSH_USERS_LAYER,
    payload: { userID, username, avatar },
  });
};

/**
 * Method set current viewable index of the card when list scrolling
 * @param index Current index that's being scrolled
 */
export const setCurrentViewableListIndex = (index: number) => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_VIEWABLE_POST_INDEX,
    payload: index,
  });
};

/**
 * Method pop user layer when going back
 */
export const popUserLayer = () => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.POP_USERS_LAYER,
    payload: null,
  });
};

/**
 * Method set current focused tab screen
 * @param tab Tab screen to set focus
 */
export const setCurrentTabForUserStack = (tab: CurrentTabScreen) => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_TAB,
    payload: tab,
  });
};

/**
 * Method clear the stack when going back to the first screen
 */
export const clearUserStack = () => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_STACK,
    payload: null,
  });
};

/**
 * Method reset all stacks
 */
export const resetAllUserStacks = () => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.RESET_ALL_STACKS,
    payload: null,
  });
};

/**
 * Method clear error from follow
 */
export const clearFollowError = () => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_FOLLOW_ERROR,
    payload: null,
  });
};

/**
 * Method clear error from unfollow
 */
export const clearUnfollowError = () => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_UNFOLLOW_ERROR,
    payload: null,
  });
};

/**
 * Method increase likes
 */
export const increaseLikes = (postID: string) => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.INCREASE_LIKES,
    payload: postID,
  });
};

/**
 * Method decrease likes
 */
export const decreaseLikes = (postID: string) => (
  dispatch: (action: UserStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.DECREASE_LIKES,
    payload: postID,
  });
};

/* ------------------- end ultilities ------------------- */

/**
 * Method fetch user from database
 * @param userID User's ID to fetch
 */
export const fetchUser = (userID: string) => async (
  dispatch: (action: UserStackAction) => void,
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
    let currentUser = null;
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
      currentUser = {
        id: myself.id,
        username: myself.username,
        avatar: myself.avatar,
      };
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

    const posts = await FSdocsToPostArray(documentSnapshots.docs, currentUser);

    if (posts.length === 0) {
      return dispatch(fetchUserSuccess(completeUserLayer));
    }

    completeUserLayer.posts = posts;
    completeUserLayer.lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchUserSuccess(completeUserLayer));
  } catch (err) {
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

/**
 * Method fetch more user's posts when post list reaches end
 * @param userID User's ID to fetch posts
 * @param isFollowed Flag to decide if fetching public + followers posts or public only
 */
export const fetchMorePostsFromUser = (
  userID: string,
  isFollowed: boolean,
) => async (
  dispatch: (action: UserStackAction) => void,
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

    let currentUser = null;
    const { user } = getState().auth;
    if (user) {
      currentUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      };
    }
    const posts = await FSdocsToPostArray(documentSnapshots.docs, currentUser);

    if (posts.length === 0) {
      return dispatch(fetchMorePostsFromUserSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchMorePostsFromUserSuccess(posts, newLastVisible));
  } catch (err) {
    dispatch(
      fetchMorePostsFromUserFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

/**
 * Method follow a user
 * @param followingUserID User's ID to follow
 */
export const followUser = (followingUserID: string) => async (
  dispatch: (action: UserStackAction) => void,
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
    await fsDB.runTransaction(async (trans) => {
      // update myself's following number
      const myselfDoc = await trans.get(myselfRef);
      const newFollowing = myselfDoc.data()!.following + 1;
      trans.update(myselfRef, { following: newFollowing });

      // update myself's following list
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
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(followUserFailure(new Error(err.message)));
      default:
        return dispatch(
          followUserFailure(new Error('Error occurred. Please try again.')),
        );
    }
  }
};

/**
 * Method unfollow a user
 * @param unfollowingUserID User's ID to unfollow
 */
export const unfollowUser = (unfollowingUserID: string) => async (
  dispatch: (action: UserStackAction) => void,
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
    await fsDB.runTransaction(async (trans) => {
      const myselfDoc = await trans.get(myselfRef);
      const newFollowing = myselfDoc.data()!.following - 1;
      trans.update(myselfRef, { following: newFollowing });

      const followingRef = fsDB
        .collection('users')
        .doc(user.id)
        .collection('following_list')
        .doc(unfollowingUserID);
      trans.delete(followingRef);
    });
    dispatch(unfollowUserSuccess());
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(unfollowUserFailure(new Error(err.message)));
      default:
        return dispatch(
          unfollowUserFailure(new Error('Error occurred. Please try again.')),
        );
    }
  }
};

/* ------------------- user dispatches ------------------ */

const fetchUserStarted = (): UserStackAction => ({
  type: DispatchTypes.FETCH_USER_STARTED,
  payload: null,
});

const fetchUserSuccess = (payload: {
  name: string;
  bio: string;
  following: number;
  followers: number;
  totalPosts: number;
  isFollowed: boolean;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  posts: Array<Post>;
}): UserStackAction => ({
  type: DispatchTypes.FETCH_USER_SUCCESS,
  payload,
});

const fetchUserFailure = (error: Error): UserStackAction => ({
  type: DispatchTypes.FETCH_USER_FAILURE,
  payload: error,
});

const fetchMorePostsFromUserStarted = (): UserStackAction => ({
  type: DispatchTypes.FETCH_MORE_POSTS_FROM_USER_STARTED,
  payload: null,
});

const fetchMorePostsFromUserSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): UserStackAction => ({
  type: DispatchTypes.FETCH_MORE_POSTS_FROM_USER_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchMorePostsFromUserFailure = (error: Error): UserStackAction => ({
  type: DispatchTypes.FETCH_MORE_POSTS_FROM_USER_FAILURE,
  payload: error,
});

const followUserStarted = (): UserStackAction => ({
  type: DispatchTypes.FOLLOW_USER_STARTED,
  payload: null,
});

const followUserSuccess = (): UserStackAction => ({
  type: DispatchTypes.FOLLOW_USER_SUCCESS,
  payload: null,
});

const followUserFailure = (error: Error): UserStackAction => ({
  type: DispatchTypes.FOLLOW_USER_FAILURE,
  payload: error,
});

const unfollowUserStarted = (): UserStackAction => ({
  type: DispatchTypes.UNFOLLOW_USER_STARTED,
  payload: null,
});

const unfollowUserSuccess = (): UserStackAction => ({
  type: DispatchTypes.UNFOLLOW_USER_SUCCESS,
  payload: null,
});

const unfollowUserFailure = (error: Error): UserStackAction => ({
  type: DispatchTypes.UNFOLLOW_USER_FAILURE,
  payload: error,
});

/* ----------------- end user dispatches ---------------- */
