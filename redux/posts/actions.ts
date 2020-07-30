import {
  FETCH_PUBLIC_NEWPOSTS_STARTED,
  FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  FETCH_PUBLIC_NEWPOSTS_FAILURE,
  FETCH_PUBLIC_NEWPOSTS_END,
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE,
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED,
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  FETCH_PUBLIC_HOTPOSTS_END,
  FETCH_PUBLIC_HOTPOSTS_FAILURE,
  FETCH_PUBLIC_HOTPOSTS_STARTED,
  FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE,
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED,
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  FETCH_FOLLOWING_NEWPOSTS_STARTED,
  FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  FETCH_FOLLOWING_NEWPOSTS_END,
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED,
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  FETCH_FOLLOWING_HOTPOSTS_END,
  FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  FETCH_FOLLOWING_HOTPOSTS_STARTED,
  FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED,
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  FETCH_USER_POSTS_FAILURE,
  FETCH_USER_POSTS_STARTED,
  FETCH_USER_POSTS_SUCCESS,
  FETCH_USER_POSTS_END,
  PULL_TO_FETCH_USER_POSTS_FAILURE,
  PULL_TO_FETCH_USER_POSTS_STARTED,
  PULL_TO_FETCH_USER_POSTS_SUCCESS,
  FETCH_TAGGED_POSTS_END,
  FETCH_TAGGED_POSTS_FAILURE,
  FETCH_TAGGED_POSTS_STARTED,
  FETCH_TAGGED_POSTS_SUCCESS,
  PULL_TO_FETCH_TAGGED_POSTS_FAILURE,
  PULL_TO_FETCH_TAGGED_POSTS_STARTED,
  PULL_TO_FETCH_TAGGED_POSTS_SUCCESS,
  PostAction,
  SET_PUBLIC_HOTTIME,
  SET_FOLLOWING_HOTTIME,
  SET_PUBLIC_FEED_CHOICE,
  SET_FOLLOWING_FEED_CHOICE,
  CREATE_POST_FAILURE,
  CREATE_POST_STARTED,
  CREATE_POST_SUCCESS,
  DELETE_POST_FAILURE,
  DELETE_POST_STARTED,
  DELETE_POST_SUCCESS,
  LIKE_POST_STARTED,
  LIKE_POST_FAILURE,
  LIKE_POST_SUCCESS,
  UNLIKE_POST_FAILURE,
  UNLIKE_POST_STARTED,
  UNLIKE_POST_SUCCESS,
  INCREASE_COMMENTS_BY_NUMBER,
  DECREASE_COMMENTS_BY_NUMBER,
  CLEAR,
} from './types';
import { Post } from '../../models';
import {
  fsDB,
  postsPerBatch,
  fbDB,
  FirebaseFirestoreTypes,
  fireFuncs,
} from '../../config';
import { AppState } from '../store';
import {
  getCurrentUnixTime,
  docFStoPostArray,
  docFBtoPostArray,
  uploadMedia,
  delay,
  deleteMedia,
  convertTime,
} from '../../utils/functions';
import {
  pendingDeletePostFlag,
  pendingPostID,
  tokenForTag,
  separatorForTag,
} from '../../constants';

/* -------------------- post actions -------------------- */

/* ---------------- public posts methods ---------------- */

export const fetchPublicNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  // console.log('fetch public new');
  dispatch(fetchPublicNewPostsStarted());
  try {
    // await delay(500);
    // const percent = Math.floor(Math.random() * 100);
    // console.log(percent);
    // if (percent > 50) throw new Error('dummy error');
    // throw new Error('dummy error');

    const { lastNewVisible } = getState().allPosts.public;
    const { user } = getState().auth;
    const currentUser = {
      id: user?.id,
      username: user?.username,
      avatar: user?.avatar,
    };

    let query: FirebaseFirestoreTypes.Query;
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

    if (documentSnapshots.size === 0) {
      return dispatch(fetchPublicNewPostsEnd());
    }

    const newPosts = await docFStoPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicNewPostsEnd());
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].datePosted;

    dispatch(fetchPublicNewPostsSuccess(newPosts, newLastNewVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchPublicNewPostsFailure(new Error('Internal server error')));
  }
};

export const pullToFetchPublicNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchPublicNewPostsStarted());
  try {
    // await delay(3000);
    const { user } = getState().auth;
    const currentPosts = getState().allPosts.public.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;
    const currentUser = {
      id: user?.id,
      username: user?.username,
      avatar: user?.avatar,
    };
    const documentSnapshots = await fsDB
      .collection('posts')
      .where('privacy', '==', 'public')
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.size === 0) {
      return dispatch(fetchPublicNewPostsEnd());
    }

    const newPosts = await docFStoPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicNewPostsEnd());
    }

    // Keep pending-delete and pending posts
    const pendingPosts = currentPosts.filter(
      (post) =>
        post.id === pendingPostID || post.id.includes(pendingDeletePostFlag),
    );

    let allPosts = [];
    if (pendingPosts.length > 0) {
      // Because pending-delete posts might be still in the post list, newly fetched
      // posts might be duplicates with pending-delete posts and appear twice
      // in the post list
      // Solution: get all pending-delete post ids then filter the newly fetched
      // posts from them to get new posts with no duplicates
      const pendingDeletePostIDs = pendingPosts
        .filter((post) => post.id.includes(pendingDeletePostFlag))
        .map((post) => {
          const splited = post.id.split(pendingDeletePostFlag);
          return splited[0];
        });
      const mergedPosts = newPosts.concat(pendingPosts);
      const postsWithNoDuplicateWithPendingDeletePosts = mergedPosts.filter(
        (post) => !pendingDeletePostIDs.includes(post.id),
      );
      const sortedByDate = postsWithNoDuplicateWithPendingDeletePosts.sort(
        (a, b) => b.datePosted - a.datePosted,
      );
      allPosts = sortedByDate;
    } else {
      allPosts = newPosts;
    }

    // While absolutely no post is being created or deleted,
    // wipe out all remaining pending posts
    if (createPostLoading === false && deletePostLoading === false) {
      const noPending = allPosts.filter(
        (post) =>
          post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
      );
      allPosts = noPending;
    }

    const newLastNewVisible = allPosts[allPosts.length - 1].datePosted;

    dispatch(pullToFetchPublicNewPostsSuccess(allPosts, newLastNewVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(
      pullToFetchPublicNewPostsFailure(new Error('Internal server error')),
    );
  }
};

export const fetchPublicHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchPublicHotPostsStarted());
  try {
    // console.log('fetch public hot');
    const currentTime = getCurrentUnixTime();

    const { lastHotVisible, hotTime } = getState().allPosts.public;
    const { user } = getState().auth;
    const currentUser = {
      id: user?.id,
      username: user?.username,
      avatar: user?.avatar,
    };

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

    if (documentSnapshots.size === 0) {
      return dispatch(fetchPublicHotPostsEnd());
    }

    const newPosts = await docFStoPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicHotPostsEnd());
    }

    // Ensure no duplicates
    // const removedDuplicates = removeDuplicatesFromArray(newPosts);

    const newLastHotVisible = newPosts[newPosts.length - 1].datePosted;

    const sortedByLikes = newPosts.sort((a, b) => b.likes - a.likes);

    dispatch(fetchPublicHotPostsSuccess(sortedByLikes, newLastHotVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchPublicHotPostsFailure(new Error('Internal server error')));
  }
};

export const pullToFetchPublicHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchPublicHotPostsStarted());
  try {
    const currentTime = getCurrentUnixTime();

    const hotTime = getState().allPosts.public.hotTime;
    const { user } = getState().auth;
    const currentPosts = getState().allPosts.public.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;
    const currentUser = {
      id: user?.id,
      username: user?.username,
      avatar: user?.avatar,
    };

    const timeAgo = currentTime - hotTime;

    const documentSnapshots = await fsDB
      .collection('posts')
      .where('privacy', '==', 'public')
      .where('date_posted', '>=', timeAgo)
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.size === 0) {
      return dispatch(fetchPublicHotPostsEnd());
    }

    const newPosts = await docFStoPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchPublicHotPostsEnd());
    }

    // Keep pending-delete and pending posts
    const pendingPosts = currentPosts.filter(
      (post) =>
        post.id === pendingPostID || post.id.includes(pendingDeletePostFlag),
    );

    let allPosts = [];
    if (pendingPosts.length > 0) {
      // Because pending-delete posts might be still in the post list, newly fetched
      // posts might be duplicates with pending-delete posts and appear twice
      // in the post list
      // Solution: get all pending-delete post ids then filter the newly fetched
      // posts from them to get new posts with no duplicates
      const pendingDeletePostIDs = pendingPosts
        .filter((post) => post.id.includes(pendingDeletePostFlag))
        .map((post) => {
          const splited = post.id.split(pendingDeletePostFlag);
          return splited[0];
        });
      const mergedPosts = newPosts.concat(pendingPosts);
      const postsWithNoDuplicateWithPendingDeletePosts = mergedPosts.filter(
        (post) => !pendingDeletePostIDs.includes(post.id),
      );
      const sortedByDate = postsWithNoDuplicateWithPendingDeletePosts.sort(
        (a, b) => b.datePosted - a.datePosted,
      );
      allPosts = sortedByDate;
    } else {
      allPosts = newPosts;
    }

    // While absolutely no post is being created or deleted,
    // wipe out all remaining pending posts
    if (createPostLoading === false && deletePostLoading === false) {
      const noPending = allPosts.filter(
        (post) =>
          post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
      );
      allPosts = noPending;
    }

    const newLastHotVisible = allPosts[allPosts.length - 1].datePosted;

    // const newLastHotVisible = newPosts[newPosts.length - 1].datePosted;

    const sortedByLikes = allPosts.sort((a, b) => b.likes - a.likes);

    dispatch(
      pullToFetchPublicHotPostsSuccess(sortedByLikes, newLastHotVisible),
    );
  } catch (err) {
    console.log(err.message);
    dispatch(
      pullToFetchPublicHotPostsFailure(new Error('Internal server error')),
    );
  }
};

/* -------------- end public posts methods -------------- */

/* --------------- following posts methods -------------- */

export const fetchFollowingNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  // console.log('fetch following new');
  dispatch(fetchFollowingNewPostsStarted());
  try {
    const { allPosts, auth } = getState();
    const { lastNewVisible } = allPosts.following;

    const currentUser = {
      id: auth.user?.id,
      username: auth.user?.username,
      avatar: auth.user?.avatar,
    };

    let docCollection: Array<string> = [];

    if (lastNewVisible === 0) {
      // get document from realtime db
      const snapshots = await fbDB
        .ref(`users/${currentUser.id}/following_posts`)
        .orderByChild('date_posted')
        .limitToLast(postsPerBatch)
        .once('value');

      const dataForSorting: Array<{
        id: string;
        date_posted: number;
      }> = [];

      snapshots.forEach((doc: { key: string; val: Function }) => {
        dataForSorting.push({
          id: doc.key as string,
          date_posted: doc.val().date_posted,
        });
      });
      // ensure sorted by date
      dataForSorting.sort((a, b) => b.date_posted - a.date_posted);

      // array of document's id
      docCollection = dataForSorting.map((doc) => doc.id);
    } else {
      const snapshots = await fbDB
        .ref(`users/${currentUser.id}/following_posts`)
        .orderByChild('date_posted')
        .endAt(lastNewVisible)
        .limitToLast(postsPerBatch + 1)
        .once('value');
      const dataForSorting: Array<{
        id: string;
        date_posted: number;
      }> = [];
      snapshots.forEach((doc: { key: string; val: Function }) => {
        dataForSorting.push({
          id: doc.key as string,
          date_posted: doc.val().date_posted,
        });
      });
      dataForSorting.pop();
      dataForSorting.sort((a, b) => b.date_posted - a.date_posted);
      docCollection = dataForSorting.map((doc) => doc.id);
    }

    if (docCollection.length === 0) {
      return dispatch(fetchFollowingNewPostsEnd());
    }

    const newPosts = await docFBtoPostArray(docCollection, currentUser);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingNewPostsEnd());
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].datePosted;

    dispatch(fetchFollowingNewPostsSuccess(newPosts, newLastNewVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchFollowingNewPostsFailure(new Error('Internal server error')));
  }
};

export const pullToFetchFollowingNewPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchFollowingNewPostsStarted());
  try {
    const { user } = getState().auth;
    const currentPosts = getState().allPosts.following.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;

    const currentUser = {
      id: user?.id,
      username: user?.username,
      avatar: user?.avatar,
    };

    const snapshots = await fbDB
      .ref(`users/${currentUser.id}/following_posts`)
      .orderByChild('date_posted')
      .limitToLast(postsPerBatch)
      .once('value');

    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];
    snapshots.forEach((doc: { key: string; val: Function }) => {
      dataForSorting.push({
        id: doc.key as string,
        date_posted: doc.val().date_posted,
      });
    });
    dataForSorting.sort((a, b) => b.date_posted - a.date_posted);
    const docCollection = dataForSorting.map((doc) => doc.id);

    if (docCollection.length === 0) {
      return dispatch(fetchFollowingNewPostsEnd());
    }

    const newPosts = await docFBtoPostArray(docCollection, currentUser);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingNewPostsEnd());
    }

    // Keep pending-delete and pending posts
    const pendingPosts = currentPosts.filter(
      (post) =>
        post.id === pendingPostID || post.id.includes(pendingDeletePostFlag),
    );

    let allPosts = [];
    if (pendingPosts.length > 0) {
      // Because pending-delete posts might be still in the post list, newly fetched
      // posts might be duplicates with pending-delete posts and appear twice
      // in the post list
      // Solution: get all pending-delete post ids then filter the newly fetched
      // posts from them to get new posts with no duplicates
      const pendingDeletePostIDs = pendingPosts
        .filter((post) => post.id.includes(pendingDeletePostFlag))
        .map((post) => {
          const splited = post.id.split(pendingDeletePostFlag);
          return splited[0];
        });
      const mergedPosts = newPosts.concat(pendingPosts);
      const postsWithNoDuplicateWithPendingDeletePosts = mergedPosts.filter(
        (post) => !pendingDeletePostIDs.includes(post.id),
      );
      const sortedByDate = postsWithNoDuplicateWithPendingDeletePosts.sort(
        (a, b) => b.datePosted - a.datePosted,
      );
      allPosts = sortedByDate;
    } else {
      allPosts = newPosts;
    }

    // While absolutely no post is being created or deleted,
    // wipe out all remaining pending posts
    if (createPostLoading === false && deletePostLoading === false) {
      const noPending = allPosts.filter(
        (post) =>
          post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
      );
      allPosts = noPending;
    }

    const newLastNewVisible = allPosts[allPosts.length - 1].datePosted;
    dispatch(pullToFetchFollowingNewPostsSuccess(allPosts, newLastNewVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(
      pullToFetchFollowingNewPostsFailure(new Error('Internal server error')),
    );
  }
};

export const fetchFollowingHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchFollowingHotPostsStarted());
  try {
    const { lastHotVisible, hotTime } = getState().allPosts.following;
    const { user } = getState().auth;

    const currentUser = {
      id: user?.id,
      username: user?.username,
      avatar: user?.avatar,
    };

    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    let docCollection: Array<string> = [];
    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];
    if (lastHotVisible === 0) {
      const snapshots = await fbDB
        .ref(`users/${currentUser.id}/following_posts`)
        .orderByChild('date_posted')
        .startAt(timeAgo)
        .limitToLast(postsPerBatch)
        .once('value');

      snapshots.forEach((doc: { key: string; val: Function }) => {
        dataForSorting.push({
          id: doc.key as string,
          date_posted: doc.val().date_posted,
        });
      });
      dataForSorting.sort((a, b) => b.date_posted - a.date_posted);
      docCollection = dataForSorting.map((doc) => doc.id);
    } else {
      const snapshots = await fbDB
        .ref(`users/${currentUser.id}/following_posts`)
        .orderByChild('date_posted')
        .startAt(timeAgo)
        .endAt(lastHotVisible)
        .limitToLast(postsPerBatch + 1)
        .once('value');

      snapshots.forEach((doc: { key: string; val: Function }) => {
        dataForSorting.push({
          id: doc.key as string,
          date_posted: doc.val().date_posted,
        });
      });

      dataForSorting.pop();
      dataForSorting.sort((a, b) => b.date_posted - a.date_posted);
      docCollection = dataForSorting.map((doc) => doc.id);
    }
    if (docCollection.length === 0) {
      return dispatch(fetchFollowingHotPostsEnd());
    }

    const newLastHotVisible =
      dataForSorting[dataForSorting.length - 1].date_posted;

    const newPosts = await docFBtoPostArray(docCollection, currentUser);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingHotPostsEnd());
    }
    const newPostsSorted = newPosts.sort((a, b) => b.likes - a.likes);

    dispatch(fetchFollowingHotPostsSuccess(newPostsSorted, newLastHotVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchFollowingHotPostsFailure(new Error('Internal server error')));
  }
};

export const pullToFetchFollowingHotPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchFollowingHotPostsStarted());
  try {
    const { hotTime } = getState().allPosts.following;
    const { user } = getState().auth;
    const currentPosts = getState().allPosts.following.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;

    const currentUser = {
      id: user?.id,
      username: user?.username,
      avatar: user?.avatar,
    };

    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    const snapshots = await fbDB
      .ref(`users/${currentUser.id}/following_posts`)
      .orderByChild('date_posted')
      .startAt(timeAgo)
      .limitToLast(postsPerBatch)
      .once('value');

    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];
    snapshots.forEach((doc: { key: string; val: Function }) => {
      dataForSorting.push({
        id: doc.key as string,
        date_posted: doc.val().date_posted,
      });
    });
    dataForSorting.sort((a, b) => b.date_posted - a.date_posted);
    const docCollection = dataForSorting.map((doc) => doc.id);

    if (docCollection.length === 0) {
      return dispatch(fetchFollowingHotPostsEnd());
    }

    const newPosts = await docFBtoPostArray(docCollection, currentUser);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingHotPostsEnd());
    }

    // Keep pending-delete and pending posts
    const pendingPosts = currentPosts.filter(
      (post) =>
        post.id === pendingPostID || post.id.includes(pendingDeletePostFlag),
    );

    let allPosts = [];
    if (pendingPosts.length > 0) {
      // Because pending-delete posts might be still in the post list, newly fetched
      // posts might be duplicates with pending-delete posts and appear twice
      // in the post list
      // Solution: get all pending-delete post ids then filter the newly fetched
      // posts from them to get new posts with no duplicates
      const pendingDeletePostIDs = pendingPosts
        .filter((post) => post.id.includes(pendingDeletePostFlag))
        .map((post) => {
          const splited = post.id.split(pendingDeletePostFlag);
          return splited[0];
        });
      const mergedPosts = newPosts.concat(pendingPosts);
      const postsWithNoDuplicateWithPendingDeletePosts = mergedPosts.filter(
        (post) => !pendingDeletePostIDs.includes(post.id),
      );
      const sortedByDate = postsWithNoDuplicateWithPendingDeletePosts.sort(
        (a, b) => b.datePosted - a.datePosted,
      );
      allPosts = sortedByDate;
    } else {
      allPosts = newPosts;
    }

    // While absolutely no post is being created or deleted,
    // wipe out all remaining pending posts
    if (createPostLoading === false && deletePostLoading === false) {
      const noPending = allPosts.filter(
        (post) =>
          post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
      );
      allPosts = noPending;
    }

    const newLastNewVisible = allPosts[allPosts.length - 1].datePosted;
    const newPostsSorted = allPosts.sort((a, b) => b.likes - a.likes);
    dispatch(
      pullToFetchFollowingHotPostsSuccess(newPostsSorted, newLastNewVisible),
    );
  } catch (err) {
    console.log(err.message);
    dispatch(
      pullToFetchFollowingHotPostsFailure(new Error('Internal server error')),
    );
  }
};

/* ------------- end following posts methods ------------ */

/* ----------------- user posts methods ----------------- */

export const fetchUserPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  // TODO check auth
  dispatch(fetchUserPostsStarted());
  try {
    const { user } = getState().auth;
    const { lastVisible } = getState().allPosts.userPosts;

    const currentUser = {
      id: user?.id,
      avatar: user?.avatar,
      username: user?.username,
    };

    let query: FirebaseFirestoreTypes.Query;
    if (lastVisible === 0) {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', currentUser.id)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', currentUser.id)
        .where('date_posted', '<', lastVisible)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchUserPostsEnd());
    }

    const newPosts = await docFStoPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchUserPostsEnd());
    }

    // // Ensure no duplicates
    // const removedDuplicates = removeDuplicatesFromArray(newPosts);

    const newLastVisible = newPosts[newPosts.length - 1].datePosted;
    dispatch(fetchUserPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchUserPostsFailure(new Error('Internal server error')));
  }
};

export const pullToFetchUserPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchUserPostsStarted());
  try {
    const currentUser = getState().auth.user;
    const currentPosts = getState().allPosts.userPosts.posts;
    const createPostLoading = getState().allPosts.createPost.loading;
    const deletePostLoading = getState().allPosts.deletePost.loading;

    const documentSnapshots = await fsDB
      .collection('posts')
      .where('posted_by', '==', currentUser!.id)
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchUserPostsEnd());
    }

    const newPosts = await docFStoPostArray(documentSnapshots.docs, {
      id: currentUser?.id,
      username: currentUser?.username,
      avatar: currentUser?.avatar,
    });

    if (newPosts.length === 0) {
      return dispatch(fetchUserPostsEnd());
    }

    // Keep pending-delete and pending posts
    const pendingPosts = currentPosts.filter(
      (post) =>
        post.id === pendingPostID || post.id.includes(pendingDeletePostFlag),
    );

    let allPosts = [];
    if (pendingPosts.length > 0) {
      // Because pending-delete posts might be still in the post list, newly fetched
      // posts might be duplicates with pending-delete posts and appear twice
      // in the post list
      // Solution: get all pending-delete post ids then filter the newly fetched
      // posts from them to get new posts with no duplicates
      const pendingDeletePostIDs = pendingPosts
        .filter((post) => post.id.includes(pendingDeletePostFlag))
        .map((post) => {
          const splited = post.id.split(pendingDeletePostFlag);
          return splited[0];
        });
      const mergedPosts = newPosts.concat(pendingPosts);
      const postsWithNoDuplicateWithPendingDeletePosts = mergedPosts.filter(
        (post) => !pendingDeletePostIDs.includes(post.id),
      );
      const sortedByDate = postsWithNoDuplicateWithPendingDeletePosts.sort(
        (a, b) => b.datePosted - a.datePosted,
      );
      allPosts = sortedByDate;
    } else {
      allPosts = newPosts;
    }

    // While absolutely no post is being created or deleted,
    // wipe out all remaining pending posts
    if (createPostLoading === false && deletePostLoading === false) {
      const noPending = allPosts.filter(
        (post) =>
          post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
      );
      allPosts = noPending;
    }

    const newLastVisible = allPosts[allPosts.length - 1].datePosted;
    dispatch(pullToFetchUserPostsSuccess(allPosts, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(pullToFetchUserPostsFailure(new Error('Internal server error')));
  }
};

/* --------------- end user posts methods --------------- */

/* ---------------- tagged posts methods ---------------- */

export const fetchTaggedPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  // TODO check auth
  dispatch(fetchTaggedPostsStarted());
  try {
    const { user } = getState().auth;
    const currentUser = {
      id: user?.id,
      avatar: user?.avatar,
      username: user?.username,
    };
    const { lastVisible } = getState().allPosts.taggedPosts;

    let query: FirebaseFirestoreTypes.Query;
    if (lastVisible === 0) {
      query = fsDB
        .collection('posts')
        .where('tagged_users', 'array-contains', currentUser.id)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('tagged_users', 'array-contains', currentUser.id)
        .where('date_posted', '<', lastVisible)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchTaggedPostsEnd());
    }

    const newPosts = await docFStoPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchTaggedPostsEnd());
    }

    const newLastVisible = newPosts[newPosts.length - 1].datePosted;
    dispatch(fetchTaggedPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    // console.log(err.message);
    dispatch(fetchTaggedPostsFailure(err));
  }
};

export const pullToFetchTaggedPosts = () => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  dispatch(pullToFetchTaggedPostsStarted());
  try {
    const { user } = getState().auth;
    const currentUser = {
      id: user?.id,
      avatar: user?.avatar,
      username: user?.username,
    };

    const documentSnapshots = await fsDB
      .collection('posts')
      .where('tagged_users', 'array-contains', currentUser.id)
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchTaggedPostsEnd());
    }

    const newPosts = await docFStoPostArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (newPosts.length === 0) {
      return dispatch(fetchTaggedPostsEnd());
    }

    const newLastVisible = newPosts[newPosts.length - 1].datePosted;
    dispatch(pullToFetchTaggedPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(pullToFetchTaggedPostsFailure(new Error('Internal server error')));
  }
};

/* -------------- end tagged posts methods -------------- */

export const setPublicHotTime = (time: number) => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: SET_PUBLIC_HOTTIME,
    payload: time,
  });
};

export const setFollowingHotTime = (time: number) => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: SET_FOLLOWING_HOTTIME,
    payload: time,
  });
};

export const setPublicFeedChoice = (choice: string) => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: SET_PUBLIC_FEED_CHOICE,
    payload: choice,
  });
};

export const setFollowingFeedChoice = (choice: string) => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: SET_FOLLOWING_FEED_CHOICE,
    payload: choice,
  });
};

// TODO refactor this function
export const createPost = (
  {
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
  },
  callback: () => void,
) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(createPostError(new Error('Please sign in first.')));
  }
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
      id: user?.id as string,
      avatar: user?.avatar as string,
      username: user?.username as string,
    },
  };
  dispatch(createPostStarted(tempPost));
  try {
    callback();
    // await delay(5000);
    // throw new Error('Failed');
    const uid = user?.id;
    const uploadedMedia = await uploadMedia(uid as string, media);

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

    try {
      // throw new Error('Failed');
      const postRef = await fsDB.collection('posts').add({
        caption: captionWithTags,
        privacy,
        media: uploadedMedia,
        comments: 0,
        likes: 0,
        posted_by: uid as string,
        tagged_users: taggedIDs,
        date_posted: currentDatePosted,
      });

      let captionWithTagsDone = captionWithTags;
      if (taggedIDs.length > 0) {
        const taggedUsersWithToken = taggedUsers.map((u) => {
          const pureUsername = u.username
            .replace('@', '')
            .replace('\u01AA', '');
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

      const newPost = {
        id: postRef.id,
        caption: captionWithTagsDone,
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
          avatar: user?.avatar as string,
          username: user?.username as string,
        },
      };

      // if (user.followers > 0 && newPost.privacy !== 'private') {
      //   const handleCreatePostForFollowers = fireFuncs.httpsCallable(
      //     'handleCreatePostForFollowers',
      //   );
      //   await handleCreatePostForFollowers({
      //     uid: user!.id,
      //     postID: newPost.id,
      //     date_posted: newPost.datePosted,
      //   });
      // }

      // if (newPost.privacy !== 'private') {
      //   await fbDB
      //     .ref(`users/${user!.id}/following_posts`)
      //     .child(newPost.id)
      //     .set({ date_posted: newPost.datePosted });
      // }

      dispatch(createPostSuccess(newPost));
    } catch (err) {
      await deleteMedia(uid as string, uploadedMedia);
      throw err;
    }
  } catch (err) {
    console.log(err.message);
    dispatch(createPostError(err));
  }
};

export const deletePost = (postID: string) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      deletePostFailure(new Error('Unauthorized. Please sign in.'), ''),
    );
  }
  // console.log(postID);
  dispatch(deletePostStarted(postID));
  try {
    // await delay(3000);

    // const percent = Math.floor(Math.random() * 100);
    // console.log(percent);
    // if (percent > 50) throw new Error('dummy error');
    // throw new Error('dummy error');

    // const postIDPlusPendingDeleteFlag = postID + pendingDeletePostFlag;
    // const userPosts = getState().allPosts.userPosts.posts;
    // const publicPosts = getState().allPosts.public.posts;
    // const followingPosts = getState().allPosts.following.posts;

    // desire post can be in any post list
    // const desirePostInUser = userPosts.find(
    //   (post) => post.id === postIDPlusPendingDeleteFlag,
    // );
    // const desirePostInPublic = publicPosts.find(
    //   (post) => post.id === postIDPlusPendingDeleteFlag,
    // );
    // const desirePostInFollowing = followingPosts.find(
    //   (post) => post.id === postIDPlusPendingDeleteFlag,
    // );
    // if (!desirePostInUser && !desirePostInPublic && !desirePostInFollowing) {
    //   throw new Error('Error occured. Post not found');
    // }

    // const desirePost = [
    //   desirePostInUser,
    //   desirePostInFollowing,
    //   desirePostInPublic,
    // ].find((post) => post !== undefined) as Post;

    await fsDB.collection('posts').doc(postID).delete();
    // await deleteMedia(user!.id, desirePost.media);

    // if (user.followers > 0 && desirePost.privacy !== 'private') {
    //   const handleDeletePostForFollowers = fireFuncs.httpsCallable(
    //     'handleDeletePostForFollowers',
    //   );
    //   await handleDeletePostForFollowers({ postID });
    // }

    dispatch(deletePostSuccess(postID));
  } catch (err) {
    console.log(err.message);
    dispatch(deletePostFailure(err, postID));
  }
};

export const likePost = (postID: string) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      likePostFailure(new Error('Unauthorized. Please sign in.'), ''),
    );
  }
  dispatch(likePostStarted(postID));
  try {
    // throw new Error('dummy error');
    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(postRef);
      const newLikes = doc.data()!.likes + 1;
      trans.update(postRef, { likes: newLikes });
      // throw new Error('error when like');
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('like_list')
        .doc(user.id);
      const like = await likeRef.get();
      if (like.exists) {
        throw new Error('Invalid operation.');
      }
      trans.set(likeRef, { c: 1 });
    });
    dispatch(likePostSuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(likePostFailure(err, postID));
  }
};

export const unlikePost = (postID: string) => async (
  dispatch: (action: PostAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      unlikePostFailure(new Error('Unauthorized. Please sign in.'), ''),
    );
  }
  dispatch(unlikePostStarted(postID));
  try {
    // throw new Error('dummy error');
    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(postRef);
      const newLikes = doc.data()!.likes - 1;
      trans.update(postRef, { likes: newLikes });
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('like_list')
        .doc(user.id);
      trans.delete(likeRef);
    });
    dispatch(unlikePostSuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(unlikePostFailure(err, postID));
  }
};

export const clear = () => (dispatch: (action: PostAction) => void) => {
  dispatch({
    type: CLEAR,
    payload: null,
  });
};

export const increaseCommentsBy = (postID: string, by: number) => (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: INCREASE_COMMENTS_BY_NUMBER,
    payload: { postID, by },
  });
};

export const decreaseCommentsBy = (postID: string, by: number) => (
  dispatch: (action: PostAction) => void,
) => {
  dispatch({
    type: DECREASE_COMMENTS_BY_NUMBER,
    payload: { postID, by },
  });
};

/* ------------------ end post actions ------------------ */

/* ------------------- post dispatches ------------------ */

/* ----------------- public posts actions ---------------- */

const fetchPublicNewPostsStarted = (): PostAction => ({
  type: FETCH_PUBLIC_NEWPOSTS_STARTED,
  payload: null,
});

const fetchPublicNewPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchPublicNewPostsFailure = (error: Error): PostAction => ({
  type: FETCH_PUBLIC_NEWPOSTS_FAILURE,
  payload: error,
});

const fetchPublicNewPostsEnd = (): PostAction => ({
  type: FETCH_PUBLIC_NEWPOSTS_END,
  payload: null,
});

const pullToFetchPublicNewPostsStarted = (): PostAction => ({
  type: PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED,
  payload: null,
});

const pullToFetchPublicNewPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchPublicNewPostsFailure = (error: Error): PostAction => ({
  type: PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE,
  payload: error,
});

const fetchPublicHotPostsStarted = (): PostAction => ({
  type: FETCH_PUBLIC_HOTPOSTS_STARTED,
  payload: null,
});

const fetchPublicHotPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchPublicHotPostsFailure = (error: Error): PostAction => ({
  type: FETCH_PUBLIC_HOTPOSTS_FAILURE,
  payload: error,
});

const fetchPublicHotPostsEnd = (): PostAction => ({
  type: FETCH_PUBLIC_HOTPOSTS_END,
  payload: null,
});

const pullToFetchPublicHotPostsStarted = (): PostAction => ({
  type: PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED,
  payload: null,
});

const pullToFetchPublicHotPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchPublicHotPostsFailure = (error: Error): PostAction => ({
  type: PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE,
  payload: error,
});

/* -------------- end public posts actions -------------- */

/* --------------- following posts actions -------------- */

const fetchFollowingNewPostsStarted = (): PostAction => ({
  type: FETCH_FOLLOWING_NEWPOSTS_STARTED,
  payload: null,
});

const fetchFollowingNewPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchFollowingNewPostsFailure = (error: Error): PostAction => ({
  type: FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  payload: error,
});

const fetchFollowingNewPostsEnd = (): PostAction => ({
  type: FETCH_FOLLOWING_NEWPOSTS_END,
  payload: null,
});

const pullToFetchFollowingNewPostsStarted = (): PostAction => ({
  type: PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED,
  payload: null,
});

const pullToFetchFollowingNewPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchFollowingNewPostsFailure = (error: Error): PostAction => ({
  type: PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  payload: error,
});

const fetchFollowingHotPostsStarted = (): PostAction => ({
  type: FETCH_FOLLOWING_HOTPOSTS_STARTED,
  payload: null,
});

const fetchFollowingHotPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchFollowingHotPostsFailure = (error: Error): PostAction => ({
  type: FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  payload: error,
});

const fetchFollowingHotPostsEnd = (): PostAction => ({
  type: FETCH_FOLLOWING_HOTPOSTS_END,
  payload: null,
});

const pullToFetchFollowingHotPostsStarted = (): PostAction => ({
  type: PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED,
  payload: null,
});

const pullToFetchFollowingHotPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchFollowingHotPostsFailure = (error: Error): PostAction => ({
  type: PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  payload: error,
});

const fetchUserPostsStarted = (): PostAction => ({
  type: FETCH_USER_POSTS_STARTED,
  payload: null,
});

const fetchUserPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: FETCH_USER_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchUserPostsFailure = (error: Error): PostAction => ({
  type: FETCH_USER_POSTS_FAILURE,
  payload: error,
});

const fetchUserPostsEnd = (): PostAction => ({
  type: FETCH_USER_POSTS_END,
  payload: null,
});

const pullToFetchUserPostsStarted = (): PostAction => ({
  type: PULL_TO_FETCH_USER_POSTS_STARTED,
  payload: null,
});

const pullToFetchUserPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: PULL_TO_FETCH_USER_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchUserPostsFailure = (error: Error): PostAction => ({
  type: PULL_TO_FETCH_USER_POSTS_FAILURE,
  payload: error,
});

const fetchTaggedPostsStarted = (): PostAction => ({
  type: FETCH_TAGGED_POSTS_STARTED,
  payload: null,
});

const fetchTaggedPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: FETCH_TAGGED_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const fetchTaggedPostsFailure = (error: Error): PostAction => ({
  type: FETCH_TAGGED_POSTS_FAILURE,
  payload: error,
});

const fetchTaggedPostsEnd = (): PostAction => ({
  type: FETCH_TAGGED_POSTS_END,
  payload: null,
});

const pullToFetchTaggedPostsStarted = (): PostAction => ({
  type: PULL_TO_FETCH_TAGGED_POSTS_STARTED,
  payload: null,
});

const pullToFetchTaggedPostsSuccess = (
  posts: Array<any>,
  lastVisible: number,
): PostAction => ({
  type: PULL_TO_FETCH_TAGGED_POSTS_SUCCESS,
  payload: { posts, lastVisible },
});

const pullToFetchTaggedPostsFailure = (error: Error): PostAction => ({
  type: PULL_TO_FETCH_TAGGED_POSTS_FAILURE,
  payload: error,
});

/* ------------- end following posts actions ------------ */

/* ----------------- create post actions ---------------- */

const createPostStarted = (tempPost: Post): PostAction => ({
  type: CREATE_POST_STARTED,
  payload: tempPost,
});

const createPostSuccess = (newPost: Post): PostAction => ({
  type: CREATE_POST_SUCCESS,
  payload: newPost,
});

const createPostError = (error: Error): PostAction => ({
  type: CREATE_POST_FAILURE,
  payload: error,
});

/* --------------- end create post actions -------------- */

/* ----------------- delete post actions ---------------- */

const deletePostStarted = (postID: string): PostAction => ({
  type: DELETE_POST_STARTED,
  payload: postID,
});

const deletePostSuccess = (postID: string): PostAction => ({
  type: DELETE_POST_SUCCESS,
  payload: postID,
});

const deletePostFailure = (error: Error, postID: string): PostAction => ({
  type: DELETE_POST_FAILURE,
  payload: {
    error,
    postID,
  },
});

/* --------------- end delete post actions -------------- */

/* ------------------ like post actions ----------------- */

const likePostStarted = (postID: string): PostAction => ({
  type: LIKE_POST_STARTED,
  payload: postID,
});

const likePostSuccess = (): PostAction => ({
  type: LIKE_POST_SUCCESS,
  payload: null,
});

const likePostFailure = (error: Error, postID: string): PostAction => ({
  type: LIKE_POST_FAILURE,
  payload: {
    error,
    postID,
  },
});

const unlikePostStarted = (postID: string): PostAction => ({
  type: UNLIKE_POST_STARTED,
  payload: postID,
});

const unlikePostSuccess = (): PostAction => ({
  type: UNLIKE_POST_SUCCESS,
  payload: null,
});

const unlikePostFailure = (error: Error, postID: string): PostAction => ({
  type: UNLIKE_POST_FAILURE,
  payload: {
    error,
    postID,
  },
});

/* ---------------- end like post actions --------------- */

/* ----------------- end post dispatches ---------------- */
