import { PostAction, DispatchTypes } from './types';
import { Post } from '../../models';
import {
  fsDB,
  postsPerBatch,
  fbDB,
  FirebaseFirestoreTypes,
  fireFuncs,
  FirebaseDatabaseTypes,
} from '../../config';
import { AppState } from '../store';
import {
  getCurrentUnixTime,
  FSdocsToPostArray,
  postIDsToPostArray,
  uploadMedia,
  delay,
  deleteMedia,
  convertTime,
  randomlyThrowError,
} from '../../utils/functions';
import { MyError, MyErrorCodes } from '../../models';
import {
  pendingDeletePostFlag,
  pendingPostID,
  tokenForTag,
  separatorForTag,
} from '../../constants';

/**
 * Method to process post to get the final post array
 * with no conflicts or duplicates
 */
const processPostsToEnsureNoConflictsWithPendingPosts = (
  currentPosts: Array<Post>,
  newPosts: Array<Post>,
  isAnyPostBeingAddedOrDeleted: boolean,
) => {
  /**
   * Because pending-delete posts might still be in the post list,
   * newly fetched posts can be duplicates with pending-delete
   * posts and appear twice in the post list
   *
   * Solution: get all pending-delete posts' original ids then filter
   * them out of newly fetched posts + current posts to get a post list
   * with no duplicates
   */

  // keep pending-delete and pending posts
  const pendingPosts = currentPosts.filter(
    (post) =>
      post.id === pendingPostID || post.id.includes(pendingDeletePostFlag),
  );

  let finalPosts = [];
  if (pendingPosts.length > 0) {
    // get pending-delete post ids from pending posts
    const pendingDeletePostIDs = pendingPosts
      .filter((post) => post.id.includes(pendingDeletePostFlag))
      .map((post) => {
        const splited = post.id.split(pendingDeletePostFlag);
        return splited[0];
      });

    // merge with newly fetched posts
    const mergedPosts = newPosts.concat(pendingPosts);

    // filter pending-delete post ids out of merged post list
    const postsWithNoDuplicateWithPendingDeletePosts = mergedPosts.filter(
      (post) => !pendingDeletePostIDs.includes(post.id),
    );
    const sortedByDate = postsWithNoDuplicateWithPendingDeletePosts.sort(
      (a, b) => b.datePosted - a.datePosted,
    );
    finalPosts = sortedByDate;
  } else {
    finalPosts = newPosts;
  }

  /**
   * while absolutely no post is being created or deleted,
   * wipe out all remaining pending posts
   */
  if (isAnyPostBeingAddedOrDeleted === false) {
    const noPending = finalPosts.filter(
      (post) =>
        post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
    );
    finalPosts = noPending;
  }

  return finalPosts;
};

/* -------------------- post actions -------------------- */

/* ---------------- public posts methods ---------------- */

/**
 * Method fetch public new posts by batch
 */
export const fetchPublicNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchPublicNewPostsStarted());
  try {
    let query: FirebaseFirestoreTypes.Query;
    const { lastNewVisible } = getState().allPosts.public;
    if (lastNewVisible === 0) {
      query = fsDB
        .collection('posts')
        .where('privacy', '==', 'public')
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('privacy', '==', 'public')
        .where('date_posted', '<', lastNewVisible)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchPublicNewPostsSuccess([], lastNewVisible));
    }

    // get post array from firestore docs
    const { user } = getState().auth;
    let currentUser = null;
    if (user) {
      currentUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      };
    }
    const newPosts = await FSdocsToPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicNewPostsSuccess([], lastNewVisible));
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].datePosted;

    dispatch(fetchPublicNewPostsSuccess(newPosts, newLastNewVisible));
  } catch (err) {
    dispatch(
      fetchPublicNewPostsFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

/**
 * Method refetch public new posts when pulling list
 */
export const pullToFetchPublicNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchPublicNewPostsStarted());
  try {
    const { lastNewVisible } = getState().allPosts.public;
    const documentSnapshots = await fsDB
      .collection('posts')
      .where('privacy', '==', 'public')
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchPublicNewPostsSuccess([], lastNewVisible));
    }

    // get post array from firestore docs
    const { user } = getState().auth;
    let currentUser = null;
    if (user) {
      currentUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      };
    }
    const newPosts = await FSdocsToPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicNewPostsSuccess([], lastNewVisible));
    }

    const currentPosts = getState().allPosts.public.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;
    const isAnyPostBeingAddedOrDeleted = createPostLoading || deletePostLoading;
    const finalPosts = processPostsToEnsureNoConflictsWithPendingPosts(
      currentPosts,
      newPosts,
      isAnyPostBeingAddedOrDeleted,
    );

    const newLastNewVisible = finalPosts[finalPosts.length - 1].datePosted;

    dispatch(pullToFetchPublicNewPostsSuccess(finalPosts, newLastNewVisible));
  } catch (err) {
    dispatch(
      pullToFetchPublicNewPostsFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

/**
 * Method fetch public hot posts by batch
 * from 1 week/month/year ago
 */
export const fetchPublicHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchPublicHotPostsStarted());
  try {
    /**
     * Calculate epoch time 1 week/month/year ago
     * hot time could be either 1 week/month/year
     */
    const { lastHotVisible, hotTime } = getState().allPosts.public;
    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    let query: FirebaseFirestoreTypes.Query;
    if (lastHotVisible === 0) {
      query = fsDB
        .collection('posts')
        .where('privacy', '==', 'public')
        .where('date_posted', '>=', timeAgo)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('privacy', '==', 'public')
        .where('date_posted', '<', lastHotVisible)
        .where('date_posted', '>=', timeAgo)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchPublicHotPostsSuccess([], lastHotVisible));
    }

    // get post array from firestore docs
    const { user } = getState().auth;
    let currentUser = null;
    if (user) {
      currentUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      };
    }
    const newPosts = await FSdocsToPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicHotPostsSuccess([], lastHotVisible));
    }

    const newLastHotVisible = newPosts[newPosts.length - 1].datePosted;

    const sortedByLikes = newPosts.sort((a, b) => b.likes - a.likes);

    dispatch(fetchPublicHotPostsSuccess(sortedByLikes, newLastHotVisible));
  } catch (err) {
    dispatch(
      fetchPublicHotPostsFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

/**
 * Method refetch public hot posts when pulling list
 */
export const pullToFetchPublicHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchPublicHotPostsStarted());
  try {
    /**
     * Calculate epoch time 1 week/month/year ago
     * hot time could be either 1 week/month/year
     */
    const { lastHotVisible, hotTime } = getState().allPosts.public;
    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    const documentSnapshots = await fsDB
      .collection('posts')
      .where('privacy', '==', 'public')
      .where('date_posted', '>=', timeAgo)
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchPublicHotPostsSuccess([], lastHotVisible));
    }

    // get post array from firestore docs
    const { user } = getState().auth;
    let currentUser = null;
    if (user) {
      currentUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      };
    }
    const newPosts = await FSdocsToPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicHotPostsSuccess([], lastHotVisible));
    }

    const currentPosts = getState().allPosts.public.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;
    const isAnyPostBeingAddedOrDeleted = createPostLoading || deletePostLoading;
    const finalPosts = processPostsToEnsureNoConflictsWithPendingPosts(
      currentPosts,
      newPosts,
      isAnyPostBeingAddedOrDeleted,
    );

    const newLastHotVisible = finalPosts[finalPosts.length - 1].datePosted;

    finalPosts.sort((a, b) => b.likes - a.likes);

    dispatch(pullToFetchPublicHotPostsSuccess(finalPosts, newLastHotVisible));
  } catch (err) {
    dispatch(
      pullToFetchPublicHotPostsFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

/* -------------- end public posts methods -------------- */

/* --------------- following posts methods -------------- */

/**
 * Method fetch posts whose the user has followed
 */
export const fetchFollowingNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchFollowingNewPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Not authenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { lastNewVisible } = getState().allPosts.following;
    let postIDs: Array<string> = [];
    let query: FirebaseDatabaseTypes.Query;

    if (lastNewVisible === 0) {
      query = fbDB
        .ref(`users/${user.id}/following_posts`)
        .orderByChild('date_posted')
        .limitToLast(postsPerBatch);
    } else {
      query = fbDB
        .ref(`users/${user.id}/following_posts`)
        .orderByChild('date_posted')
        .endAt(lastNewVisible)
        .limitToLast(postsPerBatch + 1);
    }

    const documentSnapshots = await query.once('value');

    if (documentSnapshots.hasChildren() === false) {
      return dispatch(fetchFollowingNewPostsSuccess([], lastNewVisible));
    }

    /**
     * Get array of id and date_posted first
     * to sort, then map to array of ids only
     */
    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];

    documentSnapshots.forEach((doc: { key: string; val: Function }) => {
      dataForSorting.push({
        id: doc.key,
        date_posted: doc.val().date_posted,
      });
    });

    /**
     * Since endAt() of realtime database is inclusive,
     * it needs to omit the last item
     */
    if (lastNewVisible !== 0) {
      dataForSorting.pop();
    }

    // ensure sorted by date
    dataForSorting.sort((a, b) => b.date_posted - a.date_posted);

    // array of document's id
    postIDs = dataForSorting.map((doc) => doc.id);
    if (postIDs.length === 0) {
      return dispatch(fetchFollowingNewPostsSuccess([], lastNewVisible));
    }

    const currentUser = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    };
    const newPosts = await postIDsToPostArray(postIDs, currentUser);
    if (newPosts.length === 0) {
      return dispatch(fetchFollowingNewPostsSuccess([], lastNewVisible));
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].datePosted;

    dispatch(fetchFollowingNewPostsSuccess(newPosts, newLastNewVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(fetchFollowingNewPostsFailure(new Error(err.message)));
      default:
        return dispatch(
          fetchFollowingNewPostsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

/**
 * Method refetch following new posts when pulling list
 */
export const pullToFetchFollowingNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchFollowingNewPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { lastNewVisible } = getState().allPosts.following;
    const documentSnapshots = await fbDB
      .ref(`users/${user.id}/following_posts`)
      .orderByChild('date_posted')
      .limitToLast(postsPerBatch)
      .once('value');

    if (documentSnapshots.hasChildren() === false) {
      return dispatch(fetchFollowingNewPostsSuccess([], lastNewVisible));
    }

    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];

    documentSnapshots.forEach((doc: { key: string; val: Function }) => {
      dataForSorting.push({
        id: doc.key as string,
        date_posted: doc.val().date_posted,
      });
    });

    dataForSorting.sort((a, b) => b.date_posted - a.date_posted);
    const postIDs = dataForSorting.map((doc) => doc.id);
    if (postIDs.length === 0) {
      return dispatch(fetchFollowingNewPostsSuccess([], lastNewVisible));
    }

    const currentUser = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    };
    const newPosts = await postIDsToPostArray(postIDs, currentUser);
    if (newPosts.length === 0) {
      return dispatch(fetchFollowingNewPostsSuccess([], lastNewVisible));
    }

    const currentPosts = getState().allPosts.following.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;
    const isAnyPostBeingAddedOrDeleted = createPostLoading || deletePostLoading;
    const finalPosts = processPostsToEnsureNoConflictsWithPendingPosts(
      currentPosts,
      newPosts,
      isAnyPostBeingAddedOrDeleted,
    );

    const newLastNewVisible = finalPosts[finalPosts.length - 1].datePosted;
    dispatch(
      pullToFetchFollowingNewPostsSuccess(finalPosts, newLastNewVisible),
    );
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(
          pullToFetchFollowingNewPostsFailure(new Error(err.message)),
        );
      default:
        return dispatch(
          pullToFetchFollowingNewPostsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

export const fetchFollowingHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchFollowingHotPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    /**
     * Calculate epoch time 1 week/month/year ago
     * hot time could be either 1 week/month/year
     */
    const { lastHotVisible, hotTime } = getState().allPosts.following;
    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    let postIDs: Array<string> = [];
    let query: FirebaseDatabaseTypes.Query;

    if (lastHotVisible === 0) {
      query = fbDB
        .ref(`users/${user.id}/following_posts`)
        .orderByChild('date_posted')
        .startAt(timeAgo)
        .limitToLast(postsPerBatch);
    } else {
      query = fbDB
        .ref(`users/${user.id}/following_posts`)
        .orderByChild('date_posted')
        .startAt(timeAgo)
        .endAt(lastHotVisible)
        .limitToLast(postsPerBatch + 1);
    }

    const documentSnapshots = await query.once('value');

    if (documentSnapshots.hasChildren() === false) {
      return dispatch(fetchFollowingHotPostsSuccess([], lastHotVisible));
    }

    /**
     * Get array of id and date_posted first
     * to sort, then map to array of ids only
     */
    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];

    documentSnapshots.forEach((doc: { key: string; val: Function }) => {
      dataForSorting.push({
        id: doc.key,
        date_posted: doc.val().date_posted,
      });
    });

    /**
     * Since endAt() of realtime database is inclusive,
     * it needs to omit the last item
     */
    if (lastHotVisible !== 0) {
      dataForSorting.pop();
    }

    // ensure sorted by date
    dataForSorting.sort((a, b) => b.date_posted - a.date_posted);

    // array of document's id
    postIDs = dataForSorting.map((doc) => doc.id);
    if (postIDs.length === 0) {
      return dispatch(fetchFollowingHotPostsSuccess([], lastHotVisible));
    }

    const currentUser = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    };
    const newPosts = await postIDsToPostArray(postIDs, currentUser);
    if (newPosts.length === 0) {
      return dispatch(fetchFollowingHotPostsSuccess([], lastHotVisible));
    }

    const newLastHotVisible = newPosts[newPosts.length - 1].datePosted;
    newPosts.sort((a, b) => b.likes - a.likes);

    dispatch(fetchFollowingHotPostsSuccess(newPosts, newLastHotVisible));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(fetchFollowingHotPostsFailure(new Error(err.message)));
      default:
        return dispatch(
          fetchFollowingHotPostsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

/**
 * Method refetch following hot posts when pulling list
 */
export const pullToFetchFollowingHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchFollowingHotPostsStarted());
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    /**
     * Calculate epoch time 1 week/month/year ago
     * hot time could be either 1 week/month/year
     */
    const { hotTime, lastHotVisible } = getState().allPosts.following;
    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    const documentSnapshots = await fbDB
      .ref(`users/${user.id}/following_posts`)
      .orderByChild('date_posted')
      .startAt(timeAgo)
      .limitToLast(postsPerBatch)
      .once('value');

    if (documentSnapshots.hasChildren() === false) {
      return dispatch(fetchFollowingHotPostsSuccess([], lastHotVisible));
    }

    /**
     * Get array of id and date_posted first
     * to sort, then map to array of ids only
     */
    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];

    documentSnapshots.forEach((doc: { key: string; val: Function }) => {
      dataForSorting.push({
        id: doc.key as string,
        date_posted: doc.val().date_posted,
      });
    });

    // ensure sorted by date
    dataForSorting.sort((a, b) => b.date_posted - a.date_posted);

    // array of document's id
    const postIDs = dataForSorting.map((doc) => doc.id);

    if (postIDs.length === 0) {
      return dispatch(fetchFollowingHotPostsSuccess([], lastHotVisible));
    }

    const currentUser = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    };
    const newPosts = await postIDsToPostArray(postIDs, currentUser);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingHotPostsSuccess([], lastHotVisible));
    }

    const currentPosts = getState().allPosts.following.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;
    const isAnyPostBeingAddedOrDeleted = createPostLoading || deletePostLoading;
    const finalPosts = processPostsToEnsureNoConflictsWithPendingPosts(
      currentPosts,
      newPosts,
      isAnyPostBeingAddedOrDeleted,
    );

    const newLastHotVisible = finalPosts[finalPosts.length - 1].datePosted;
    finalPosts.sort((a, b) => b.likes - a.likes);
    dispatch(
      pullToFetchFollowingHotPostsSuccess(finalPosts, newLastHotVisible),
    );
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(
          pullToFetchFollowingHotPostsFailure(new Error(err.message)),
        );
      default:
        return dispatch(
          pullToFetchFollowingHotPostsFailure(
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

/* ------------- end following posts methods ------------ */

/* ----------------- own posts methods ----------------- */

/**
 * Method fetch posts of current user
 */
export const fetchOwnPosts = () => async (
  dispatch: (action: PostAction) => void,
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

    const { lastVisible } = getState().allPosts.own;
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
  dispatch: (action: PostAction) => void,
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

    const { lastVisible } = getState().allPosts.own;
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

/* --------------- end own posts methods --------------- */

/* ---------------- tagged posts methods ---------------- */

/**
 * Method fetch tagged posts of current user
 */
export const fetchTaggedPosts = () => async (
  dispatch: (action: PostAction) => void,
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

    const { lastVisible } = getState().allPosts.tagged;
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
  dispatch: (action: PostAction) => void,
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

    const { lastVisible } = getState().allPosts.tagged;
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

/* -------------- end tagged posts methods -------------- */

/**
 * Method set hot time for
 * public hot post list
 * @param time Time could be 1 week/month/year
 */
export const setPublicHotTime = (time: number) => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_PUBLIC_HOTTIME,
    payload: time,
  });
};

/**
 * Method set hot time for
 * following hot post list
 * @param time Time could be 1 week/month/year
 */
export const setFollowingHotTime = (time: number) => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_FOLLOWING_HOTTIME,
    payload: time,
  });
};

/**
 * Method set feed sorted by for
 * public post list
 * @param choice Choice could be 'new' or 'hot'
 */
export const setPublicFeedChoice = (choice: 'new' | 'hot') => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_PUBLIC_FEED_CHOICE,
    payload: choice,
  });
};

/**
 * Method set feed sorted by for
 * following post list
 * @param choice Choice could be 'new' or 'hot'
 */
export const setFollowingFeedChoice = (choice: 'new' | 'hot') => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_FOLLOWING_FEED_CHOICE,
    payload: choice,
  });
};

/**
 * Method create new Post
 * @param tempPost
 */
export const createPost = ({
  privacy,
  caption,
  media,
  taggedUsers,
}: {
  privacy: 'public' | 'followers' | 'private';
  caption: string;
  media: Array<{
    uri: string;
    mime: string;
    size: number;
    width: number;
    height: number;
  }>;
  taggedUsers: Array<{ id: string; username: string }>;
}) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      createPostError(new Error('Unauthenticated. Please sign in.')),
    );
  }

  // create temporary post
  const taggedIDs = taggedUsers.map((u) => u.id);
  const currentDatePosted = getCurrentUnixTime();
  const tempPost = {
    id: pendingPostID,
    caption,
    privacy,
    media: media.map((md) => ({
      id: md.uri,
      url: md.uri,
      type: (md.mime.includes('image') ? 'image' : 'video') as
        | 'image'
        | 'video',
      width: md.width,
      height: md.height,
    })),
    datePosted: currentDatePosted,
    timeLabel: convertTime(currentDatePosted),
    likes: 0,
    isLiked: false,
    taggedUsers: taggedIDs,
    comments: 0,
    user: {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
    },
  };
  dispatch(createPostStarted(tempPost));
  try {
    // upload media first
    const uid = user.id;
    const uploadedMedia = await uploadMedia(uid, media);

    try {
      let captionWithTags = caption;
      if (taggedIDs.length > 0) {
        const regex = new RegExp(
          `@([^${tokenForTag}][^\n| ]*)${tokenForTag}`,
          'g',
        );

        const matches = caption.match(regex);
        if (matches) {
          for (const m of matches) {
            const index = taggedUsers.findIndex((u) => u.username.includes(m));
            if (index !== -1) {
              captionWithTags = captionWithTags.replace(
                m,
                `@${taggedUsers[index].id}${tokenForTag}`,
              );
            }
          }
        }
      }
      const newPost = {
        id: '',
        caption: '',
        privacy,
        media: uploadedMedia,
        datePosted: currentDatePosted,
        timeLabel: convertTime(currentDatePosted),
        likes: 0,
        isLiked: false,
        comments: 0,
        taggedUsers: taggedIDs,
        user: {
          id: user.id,
          avatar: user.avatar,
          username: user.username,
        },
      };

      const userRef = fsDB.collection('users').doc(uid);
      await fsDB.runTransaction(async (trans) => {
        // update total_posts of user
        const doc = await trans.get(userRef);
        const newTotalPosts = doc.data()!.total_posts + 1;
        trans.update(userRef, { total_posts: newTotalPosts });

        // add new post to database
        const postRef = fsDB.collection('posts').doc();
        trans.set(postRef, {
          caption: captionWithTags,
          privacy,
          media: uploadedMedia,
          comments: 0,
          likes: 0,
          posted_by: uid as string,
          tagged_users: taggedIDs,
          date_posted: currentDatePosted,
        });

        // get newly set post id
        newPost.id = postRef.id;
      });

      let captionWithTagsDone = captionWithTags;
      if (taggedIDs.length > 0) {
        const taggedUsersWithToken = taggedUsers.map((u) => {
          const pureUsername = u.username
            .replace('@', '')
            .replace(tokenForTag, '');
          return {
            id: u.id,
            idWithToken: `@${u.id}${tokenForTag}`,
            username: pureUsername,
          };
        });
        const regex = new RegExp(
          `@([^${tokenForTag}][^\n| ]*)${tokenForTag}`,
          'g',
        );
        const matches = captionWithTags.match(regex);
        if (matches) {
          for (const m of matches) {
            const index = taggedUsersWithToken.findIndex((u) =>
              u.idWithToken.includes(m),
            );
            if (index !== -1) {
              captionWithTagsDone = captionWithTagsDone.replace(
                m,
                `@${taggedUsersWithToken[index].username}${separatorForTag}${taggedUsersWithToken[index].id}${tokenForTag}`,
              );
            }
          }
        }
      }

      newPost.caption = captionWithTagsDone;

      dispatch(createPostSuccess(newPost));
    } catch (err) {
      // delete uploaded media in case adding post failed
      await deleteMedia(uid, uploadedMedia);
      throw err;
    }
  } catch (err) {
    dispatch(createPostError(new Error('Error occurred. Please try again.')));
  }
};

/**
 * Method delete a post
 * @param postID Post's ID to delete
 */
export const deletePost = (postID: string) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(deletePostStarted(postID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthorized. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const userRef = fsDB.collection('users').doc(user.id);
    await fsDB.runTransaction(async (trans) => {
      // decrease total posts of user
      const doc = await trans.get(userRef);
      const newTotalPosts = doc.data()!.total_posts - 1;
      trans.update(userRef, { total_posts: newTotalPosts });

      // delete post
      const postRef = fsDB.collection('posts').doc(postID);
      trans.delete(postRef);
    });

    dispatch(deletePostSuccess(postID));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated: {
        return dispatch(deletePostFailure(new Error(err.message), postID));
      }
      default:
        return dispatch(
          deletePostFailure(
            new Error('Error occurred. Please try again.'),
            postID,
          ),
        );
    }
  }
};

/**
 * Method like a post
 * @param postID Post's ID to like
 */
export const likePost = (postID: string) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(likePostStarted(postID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthorized. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      // update like number
      const doc = await trans.get(postRef);
      const newLikes = doc.data()!.likes + 1;
      trans.update(postRef, { likes: newLikes });

      // update post's like list
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('like_list')
        .doc(user.id);

      const like = await likeRef.get();

      // user already liked the post
      if (like.exists) {
        throw new Error('Invalid operation.');
      }
      trans.set(likeRef, { c: 1 });
    });
    dispatch(likePostSuccess());
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated: {
        return dispatch(likePostFailure(new Error(err.message), postID));
      }
      default:
        return dispatch(
          likePostFailure(
            new Error('Error occurred. Please try again.'),
            postID,
          ),
        );
    }
  }
};

/**
 * Method unlike a post
 * @param postID Post's ID to unlike
 */
export const unlikePost = (postID: string) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(unlikePostStarted(postID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthorized. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      // update like number
      const doc = await trans.get(postRef);
      const newLikes = doc.data()!.likes - 1;
      trans.update(postRef, { likes: newLikes });

      // remove liker from post's like list
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('like_list')
        .doc(user.id);

      trans.delete(likeRef);
    });
    dispatch(unlikePostSuccess());
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated: {
        return dispatch(unlikePostFailure(new Error(err.message), postID));
      }
      default:
        return dispatch(
          unlikePostFailure(
            new Error('Error occurred. Please try again.'),
            postID,
          ),
        );
    }
  }
};

/**
 * Method to reset all post lists when sign in/out
 */
export const clearAllPosts = () => (dispatch: (action: PostAction) => void) => {
  dispatch({
    type: DispatchTypes.CLEAR,
    payload: null,
  });
};

export const increaseCommentsBy = (
  postID: string,
  numberOfComments: number,
) => (dispatch: (action: PostAction) => void) => {
  dispatch({
    type: DispatchTypes.INCREASE_COMMENTS_BY_NUMBER,
    payload: { postID, numberOfComments },
  });
};

export const decreaseCommentsBy = (
  postID: string,
  numberOfComments: number,
) => (dispatch: (action: PostAction) => void) => {
  dispatch({
    type: DispatchTypes.DECREASE_COMMENTS_BY_NUMBER,
    payload: { postID, numberOfComments },
  });
};

export const clearCreatePostError = () => (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_CREATE_POST_ERROR,
    payload: null,
  });
};

export const clearDeletePostError = () => (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_DELETE_POST_ERROR,
    payload: null,
  });
};

export const clearLikePostError = () => (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_LIKE_POST_ERROR,
    payload: null,
  });
};

export const clearUnlikePostError = () => (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_UNLIKE_POST_ERROR,
    payload: null,
  });
};

/* ------------------ end post actions ------------------ */

/* ------------------- post dispatches ------------------ */

/* ----------------- public posts actions ---------------- */

const fetchPublicNewPostsStarted = (): PostAction => ({
  type: DispatchTypes.FETCH_PUBLIC_NEWPOSTS_STARTED,
  payload: null,
});

const fetchPublicNewPostsSuccess = (
  posts: Array<Post>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchPublicNewPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.FETCH_PUBLIC_NEWPOSTS_FAILURE,
  payload: error,
});

const pullToFetchPublicNewPostsStarted = (): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED,
  payload: null,
});

const pullToFetchPublicNewPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchPublicNewPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE,
  payload: error,
});

const fetchPublicHotPostsStarted = (): PostAction => ({
  type: DispatchTypes.FETCH_PUBLIC_HOTPOSTS_STARTED,
  payload: null,
});

const fetchPublicHotPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchPublicHotPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.FETCH_PUBLIC_HOTPOSTS_FAILURE,
  payload: error,
});

const fetchPublicHotPostsEnd = (): PostAction => ({
  type: FETCH_PUBLIC_HOTPOSTS_END,
  payload: null,
});

const pullToFetchPublicHotPostsStarted = (): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED,
  payload: null,
});

const pullToFetchPublicHotPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchPublicHotPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE,
  payload: error,
});

/* -------------- end public posts actions -------------- */

/* --------------- following posts actions -------------- */

const fetchFollowingNewPostsStarted = (): PostAction => ({
  type: DispatchTypes.FETCH_FOLLOWING_NEWPOSTS_STARTED,
  payload: null,
});

const fetchFollowingNewPostsSuccess = (
  posts: Array<Post>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchFollowingNewPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  payload: error,
});

const pullToFetchFollowingNewPostsStarted = (): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED,
  payload: null,
});

const pullToFetchFollowingNewPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchFollowingNewPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  payload: error,
});

const fetchFollowingHotPostsStarted = (): PostAction => ({
  type: DispatchTypes.FETCH_FOLLOWING_HOTPOSTS_STARTED,
  payload: null,
});

const fetchFollowingHotPostsSuccess = (
  posts: Array<Post>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchFollowingHotPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  payload: error,
});

const fetchFollowingHotPostsEnd = (): PostAction => ({
  type: FETCH_FOLLOWING_HOTPOSTS_END,
  payload: null,
});

const pullToFetchFollowingHotPostsStarted = (): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED,
  payload: null,
});

const pullToFetchFollowingHotPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchFollowingHotPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  payload: error,
});

const fetchOwnPostsStarted = (): PostAction => ({
  type: DispatchTypes.FETCH_OWN_POSTS_STARTED,
  payload: null,
});

const fetchOwnPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): PostAction => ({
  type: DispatchTypes.FETCH_OWN_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchOwnPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.FETCH_OWN_POSTS_FAILURE,
  payload: error,
});

const pullToFetchOwnPostsStarted = (): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_OWN_POSTS_STARTED,
  payload: null,
});

const pullToFetchOwnPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_OWN_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchOwnPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_OWN_POSTS_FAILURE,
  payload: error,
});

const fetchTaggedPostsStarted = (): PostAction => ({
  type: DispatchTypes.FETCH_TAGGED_POSTS_STARTED,
  payload: null,
});

const fetchTaggedPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): PostAction => ({
  type: DispatchTypes.FETCH_TAGGED_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchTaggedPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.FETCH_TAGGED_POSTS_FAILURE,
  payload: error,
});

const pullToFetchTaggedPostsStarted = (): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_TAGGED_POSTS_STARTED,
  payload: null,
});

const pullToFetchTaggedPostsSuccess = (
  posts: Array<Post>,
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null,
): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_TAGGED_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchTaggedPostsFailure = (error: Error): PostAction => ({
  type: DispatchTypes.PULL_TO_FETCH_TAGGED_POSTS_FAILURE,
  payload: error,
});

/* ------------- end following posts actions ------------ */

/* ----------------- create post actions ---------------- */

const createPostStarted = (tempPost: Post): PostAction => ({
  type: DispatchTypes.CREATE_POST_STARTED,
  payload: tempPost,
});

const createPostSuccess = (newPost: Post): PostAction => ({
  type: DispatchTypes.CREATE_POST_SUCCESS,
  payload: newPost,
});

const createPostError = (error: Error): PostAction => ({
  type: DispatchTypes.CREATE_POST_FAILURE,
  payload: error,
});

/* --------------- end create post actions -------------- */

/* ----------------- delete post actions ---------------- */

const deletePostStarted = (postID: string): PostAction => ({
  type: DispatchTypes.DELETE_POST_STARTED,
  payload: postID,
});

const deletePostSuccess = (postID: string): PostAction => ({
  type: DispatchTypes.DELETE_POST_SUCCESS,
  payload: postID,
});

const deletePostFailure = (error: Error, postID: string): PostAction => ({
  type: DispatchTypes.DELETE_POST_FAILURE,
  payload: {
    error,
    postID,
  },
});

/* --------------- end delete post actions -------------- */

/* ------------------ like post actions ----------------- */

const likePostStarted = (postID: string): PostAction => ({
  type: DispatchTypes.LIKE_POST_STARTED,
  payload: postID,
});

const likePostSuccess = (): PostAction => ({
  type: DispatchTypes.LIKE_POST_SUCCESS,
  payload: null,
});

const likePostFailure = (error: Error, postID: string): PostAction => ({
  type: DispatchTypes.LIKE_POST_FAILURE,
  payload: {
    error,
    postID,
  },
});

const unlikePostStarted = (postID: string): PostAction => ({
  type: DispatchTypes.UNLIKE_POST_STARTED,
  payload: postID,
});

const unlikePostSuccess = (): PostAction => ({
  type: DispatchTypes.UNLIKE_POST_SUCCESS,
  payload: null,
});

const unlikePostFailure = (error: Error, postID: string): PostAction => ({
  type: DispatchTypes.UNLIKE_POST_FAILURE,
  payload: {
    error,
    postID,
  },
});

/* ---------------- end like post actions --------------- */

/* ----------------- end post dispatches ---------------- */
