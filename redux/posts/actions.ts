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
  CLEAR,
} from './types';
// import { Post } from '../../models';
import {
  fsDB,
  postsPerBatch,
  fbDB,
  FirebaseFirestoreTypes,
} from '../../config';
import { AppState } from '../store';
import { getCurrentUnixTime, docFStoPostArray } from '../../utils/functions';

// const oneWeek = 2.365e10;

// const postIDstoPostArray = async (postIDs: Array<string>) => {
//   const newPosts = [];
//   for (const postID of postIDs) {
//     try {
//       const postRef = await fsDB.collection('posts').doc(postID).get();
//       if (!postRef.exists) continue;
//       const postData = postRef.data();

//       const userRef = await fsDB
//         .collection('users')
//         .doc(postData!.posted_by)
//         .get();

//       if (!userRef.exists) continue;

//       const userData = userRef.data();
//       const post = {
//         id: postRef.id,
//         user: {
//           username: userData!.username,
//           avatar: userData!.avatar,
//         },
//         caption: postData!.caption,
//         date_posted: postData!.date_posted,
//         likes: postData!.num_likes,
//         comments: 0,
//         media: postData!.media,
//         privacy: postData!.privacy,
//       };
//       newPosts.push(post);
//     } catch (err) {
//       continue;
//     }
//   }
//   return newPosts;
// };

const docFBtoPostArray = async (docCollection: Array<string>) => {
  const newPosts = [];
  for (const postID of docCollection) {
    try {
      const postRef = await fsDB.collection('posts').doc(postID).get();
      if (!postRef.exists) {
        continue;
      }

      const postData = postRef.data();
      const userRef = await fsDB
        .collection('users')
        .doc(postData!.posted_by)
        .get();
      if (!userRef.exists) {
        continue;
      }

      const userData = userRef.data();
      const post = {
        id: postRef.id,
        user: {
          username: userData!.username,
          avatar: userData!.avatar,
        },
        caption: postData!.caption,
        date_posted: postData!.date_posted,
        likes: postData!.num_likes,
        comments: 0,
        media: postData!.media,
        privacy: postData!.privacy,
      };
      newPosts.push(post);
    } catch (err) {
      continue;
    }
  }
  return newPosts;
};

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

    const { allPosts } = getState();
    const { lastNewVisible } = allPosts.public;

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

    const newPosts = await docFStoPostArray(documentSnapshots.docs);

    if (newPosts.length === 0) {
      return dispatch(fetchPublicNewPostsEnd());
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].date_posted;

    dispatch(fetchPublicNewPostsSuccess(newPosts, newLastNewVisible));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchPublicNewPostsFailure(new Error('Internal server error')));
  }
};

export const pullToFetchPublicNewPosts = () => async (
  dispatch: (action: PostAction) => void,
) => {
  dispatch(pullToFetchPublicNewPostsStarted());
  try {
    const documentSnapshots = await fsDB
      .collection('posts')
      .where('privacy', '==', 'public')
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.size === 0) {
      return dispatch(fetchPublicNewPostsEnd());
    }

    const newPosts = await docFStoPostArray(documentSnapshots.docs);

    if (newPosts.length === 0) {
      return dispatch(fetchPublicNewPostsEnd());
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].date_posted;

    dispatch(pullToFetchPublicNewPostsSuccess(newPosts, newLastNewVisible));
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

    const { allPosts } = getState();
    const { lastHotVisible, hotTime } = allPosts.public;

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

    const newPosts = await docFStoPostArray(documentSnapshots.docs);

    if (newPosts.length === 0) {
      return dispatch(fetchPublicHotPostsEnd());
    }

    const newLastHotVisible = newPosts[newPosts.length - 1].date_posted;

    const sortedByLikes = newPosts.sort((a, b) => b.likes - a.likes);

    dispatch(fetchPublicHotPostsSuccess(sortedByLikes, newLastHotVisible));
  } catch (err) {
    // console.log(err.code)
    // failed-precondition
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

    const newPosts = await docFStoPostArray(documentSnapshots.docs);

    if (newPosts.length === 0) {
      return dispatch(fetchPublicHotPostsEnd());
    }

    const newLastHotVisible = newPosts[newPosts.length - 1].date_posted;

    const sortedByLikes = newPosts.sort((a, b) => b.likes - a.likes);

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
    const uid = auth.user?.id;
    let docCollection: Array<string> = [];

    if (lastNewVisible === 0) {
      // get document from realtime db
      const snapshots = await fbDB
        .ref(`users/${uid}/following_posts`)
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
        .ref(`users/${uid}/following_posts`)
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

    const newPosts = await docFBtoPostArray(docCollection);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingNewPostsEnd());
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].date_posted;

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
    const { auth } = getState();
    const uid = auth.user?.id;

    const snapshots = await fbDB
      .ref(`users/${uid}/following_posts`)
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

    const newPosts = await docFBtoPostArray(docCollection);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingNewPostsEnd());
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].date_posted;
    dispatch(pullToFetchFollowingNewPostsSuccess(newPosts, newLastNewVisible));
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
    const { allPosts, auth } = getState();
    const { lastHotVisible, hotTime } = allPosts.following;
    const uid = auth.user?.id;
    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    let docCollection: Array<string> = [];
    const dataForSorting: Array<{
      id: string;
      date_posted: number;
    }> = [];
    if (lastHotVisible === 0) {
      const snapshots = await fbDB
        .ref(`users/${uid}/following_posts`)
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
        .ref(`users/${uid}/following_posts`)
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

    const newPosts = await docFBtoPostArray(docCollection);

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
    const { auth } = getState();
    const uid = auth.user?.id;
    const { hotTime } = getState().allPosts.following;
    const currentTime = getCurrentUnixTime();
    const timeAgo = currentTime - hotTime;

    const snapshots = await fbDB
      .ref(`users/${uid}/following_posts`)
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

    const newPosts = await docFBtoPostArray(docCollection);

    if (newPosts.length === 0) {
      return dispatch(fetchFollowingHotPostsEnd());
    }

    const newLastNewVisible = newPosts[newPosts.length - 1].date_posted;
    const newPostsSorted = newPosts.sort((a, b) => b.likes - a.likes);
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
    const currentUser = getState().auth.user;
    const { lastVisible } = getState().allPosts.userPosts;

    let query: FirebaseFirestoreTypes.Query;
    if (lastVisible === 0) {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', currentUser!.id)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .where('posted_by', '==', currentUser!.id)
        .where('date_posted', '<', lastVisible)
        .orderBy('date_posted', 'desc')
        .limit(postsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchUserPostsEnd());
    }

    const newPosts = [];

    for (const doc of documentSnapshots.docs) {
      const postData = doc.data();
      try {
        const post = {
          id: doc.id,
          user: {
            username: currentUser?.username,
            avatar: currentUser?.avatar,
          },
          caption: postData!.caption,
          date_posted: postData!.date_posted,
          likes: postData!.num_likes,
          comments: 0,
          media: postData!.media,
          privacy: postData!.privacy,
        };
        newPosts.push(post);
      } catch (err) {
        continue;
      }
    }

    // const newPosts = await docFStoPostArray(documentSnapshots.docs);

    if (newPosts.length === 0) {
      return dispatch(fetchUserPostsEnd());
    }

    const newLastVisible = newPosts[newPosts.length - 1].date_posted;
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

    const documentSnapshots = await fsDB
      .collection('posts')
      .where('posted_by', '==', currentUser!.id)
      .orderBy('date_posted', 'desc')
      .limit(postsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchUserPostsEnd());
    }

    // const newPosts = await docFStoPostArray(documentSnapshots.docs);

    const newPosts = [];

    for (const doc of documentSnapshots.docs) {
      const postData = doc.data();
      try {
        const post = {
          id: doc.id,
          user: {
            username: currentUser?.username,
            avatar: currentUser?.avatar,
          },
          caption: postData!.caption,
          date_posted: postData!.date_posted,
          likes: postData!.num_likes,
          comments: 0,
          media: postData!.media,
          privacy: postData!.privacy,
        };
        newPosts.push(post);
      } catch (err) {
        continue;
      }
    }

    if (newPosts.length === 0) {
      return dispatch(fetchUserPostsEnd());
    }

    // console.log(newPosts);

    const newLastVisible = newPosts[newPosts.length - 1].date_posted;
    dispatch(pullToFetchUserPostsSuccess(newPosts, newLastVisible));
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

/* ----------------- end post dispatches ---------------- */
