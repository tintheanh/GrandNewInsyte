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
import { pendingDeletePostFlag, pendingPostID } from '../../constants';

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
    // const removedDuplicates = removeDuplicatesFromPostsArray(newPosts);

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
  console.log('fetch user posts');
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
    // const removedDuplicates = removeDuplicatesFromPostsArray(newPosts);

    const newLastVisible = newPosts[newPosts.length - 1].datePosted;
    dispatch(fetchUserPostsSuccess(newPosts, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchUserPostsFailure(err));
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

    const newLastVisible = allPosts[newPosts.length - 1].datePosted;
    dispatch(pullToFetchUserPostsSuccess(allPosts, newLastVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(pullToFetchUserPostsFailure(err));
  }
};

/* --------------- end user posts methods --------------- */

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

export const createPost = (
  {
    privacy,
    caption,
    media,
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
    await delay(5000);
    // throw new Error('Failed');
    const uid = user?.id;
    const uploadedMedia = await uploadMedia(uid as string, media);
    // console.log(uploadedMedia);
    try {
      // throw new Error('Failed');
      const postRef = await fsDB.collection('posts').add({
        caption,
        privacy,
        media: uploadedMedia,
        comments: 0,
        likes: 0,
        posted_by: uid as string,
        date_posted: currentDatePosted,
      });
      const newPost = {
        id: postRef.id,
        caption,
        privacy,
        media: uploadedMedia,
        datePosted: currentDatePosted,
        timeLabel: convertTime(currentDatePosted),
        likes: 0,
        comments: 0,
        user: {
          id: user.id,
          avatar: user?.avatar as string,
          username: user?.username as string,
        },
      };
      if (user.followers > 0 && newPost.privacy !== 'private') {
        const handleCreatePostForFollowers = fireFuncs.httpsCallable(
          'handleCreatePostForFollowers',
        );
        await handleCreatePostForFollowers({
          uid: user!.id,
          postID: newPost.id,
          date_posted: newPost.datePosted,
        });
      }

      if (newPost.privacy !== 'private') {
        await fbDB
          .ref(`users/${user!.id}/following_posts`)
          .child(newPost.id)
          .set({ date_posted: newPost.datePosted });
      }

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
      deletePostError(new Error('Unauthorized. Please sign in.'), ''),
    );
  }
  // console.log(postID);
  dispatch(deletePostStarted(postID));
  try {
    await delay(3000);

    // const percent = Math.floor(Math.random() * 100);
    // console.log(percent);
    // if (percent > 50) throw new Error('dummy error');

    const postIDPlusPendingDeleteFlag = postID + pendingDeletePostFlag;
    const userPosts = getState().allPosts.userPosts.posts;
    const publicPosts = getState().allPosts.public.posts;
    const followingPosts = getState().allPosts.following.posts;

    // desire post can be in any post list
    const desirePostInUser = userPosts.find(
      (post) => post.id === postIDPlusPendingDeleteFlag,
    );
    const desirePostInPublic = publicPosts.find(
      (post) => post.id === postIDPlusPendingDeleteFlag,
    );
    const desirePostInFollowing = followingPosts.find(
      (post) => post.id === postIDPlusPendingDeleteFlag,
    );
    if (!desirePostInUser && !desirePostInPublic && !desirePostInFollowing) {
      throw new Error('Error occured. Post not found');
    }

    const desirePost = [
      desirePostInUser,
      desirePostInFollowing,
      desirePostInPublic,
    ].find((post) => post !== undefined) as Post;

    await fsDB.collection('posts').doc(postID).delete();
    await deleteMedia(user!.id, desirePost.media);

    if (user.followers > 0 && desirePost.privacy !== 'private') {
      const handleDeletePostForFollowers = fireFuncs.httpsCallable(
        'handleDeletePostForFollowers',
      );
      await handleDeletePostForFollowers({ postID });
    }

    dispatch(deletePostSuccess(postID));
  } catch (err) {
    console.log(err.message);
    dispatch(deletePostError(err, postID));
  }
};

export const clear = () => async (dispatch: (action: PostAction) => void) => {
  dispatch({
    type: CLEAR,
    payload: null,
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

const deletePostError = (error: Error, postID: string): PostAction => ({
  type: DELETE_POST_FAILURE,
  payload: {
    error,
    postID,
  },
});

/* --------------- end delete post actions -------------- */

/* ----------------- end post dispatches ---------------- */
