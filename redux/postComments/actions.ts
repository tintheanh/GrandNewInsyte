import {
  FETCH_NEW_COMMENTS_FAILURE,
  FETCH_NEW_COMMENTS_STARTED,
  FETCH_NEW_COMMENTS_SUCCESS,
  FETCH_NEW_COMMENTS_END,
  FETCH_TOP_COMMENTS_END,
  FETCH_TOP_COMMENTS_FAILURE,
  FETCH_TOP_COMMENTS_STARTED,
  FETCH_TOP_COMMENTS_SUCCESS,
  CREATE_COMMENT_FAILURE,
  CREATE_COMMENT_STARTED,
  CREATE_COMMENT_SUCCESS,
  LIKE_COMMENT_FAILURE,
  LIKE_COMMENT_STARTED,
  LIKE_COMMENT_SUCCESS,
  UNLIKE_COMMENT_FAILURE,
  UNLIKE_COMMENT_STARTED,
  UNLIKE_COMMENT_SUCCESS,
  PUSH_POSTLAYER,
  SET_SORT_COMMENTS,
  POP_POSTLAYER,
  CLEAR_CREATE_COMMENT_ERROR,
  CLEAR_INTERACT_COMMENT_ERROR,
  CLEAR_STACK,
  PostCommentsAction,
} from './types';
import { pendingCommentID } from '../../constants';
import { fsDB, FirebaseFirestoreTypes, commentsPerBatch } from '../../config';
import { PostComment } from '../../models';
import {
  delay,
  docFStoCommentArray,
  getCurrentUnixTime,
} from '../../utils/functions';
import { AppState } from '../store';

export const fetchNewComments = (postID: string) => async (
  dispatch: (action: PostCommentsAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchNewCommentsStarted(postID));
  try {
    // const percent = Math.floor(Math.random() * 100);
    // if (percent > 50) {
    //   throw new Error('dummy error');
    // }
    // console.log('fetch new cmt');
    const { user } = getState().auth;
    const lastVisible = getState().postComments.stack.top()?.lastVisible;
    let currentUser;
    if (user) {
      currentUser = {
        id: user.id,
        avatar: user.avatar,
        username: user.username,
      };
    }
    let query: FirebaseFirestoreTypes.Query;

    if (lastVisible === null) {
      query = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .orderBy('date_posted')
        .limit(commentsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .orderBy('date_posted')
        .startAfter(lastVisible)
        .limit(commentsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchNewCommentsEnd());
    }

    const comments = await docFStoCommentArray(
      postID,
      documentSnapshots.docs,
      currentUser,
    );

    if (comments.length === 0) {
      return dispatch(fetchNewCommentsEnd());
    }

    // console.log('in action', comments);

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchNewCommentsSuccess(newLastVisible, comments));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchNewCommentsFailure(new Error('Internal server error.')));
  }
};

export const fetchTopComments = (postID: string) => async (
  dispatch: (action: PostCommentsAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchTopCommentsStarted(postID));
  try {
    // const percent = Math.floor(Math.random() * 100);
    // if (percent > 50) {
    //   throw new Error('dummy error');
    // }
    const { user } = getState().auth;
    const lastVisible = getState().postComments.stack.top()?.lastVisible;
    let currentUser;
    if (user) {
      currentUser = {
        id: user.id,
        avatar: user.avatar,
        username: user.username,
      };
    }
    let query: FirebaseFirestoreTypes.Query;

    if (lastVisible === null) {
      query = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .orderBy('likes', 'desc')
        .limit(commentsPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .orderBy('likes', 'desc')
        .startAfter(lastVisible)
        .limit(commentsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchTopCommentsEnd());
    }

    const comments = await docFStoCommentArray(
      postID,
      documentSnapshots.docs,
      currentUser,
    );

    if (comments.length === 0) {
      return dispatch(fetchTopCommentsEnd());
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchTopCommentsSuccess(newLastVisible, comments));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchTopCommentsFailure(new Error('Internal server error.')));
  }
};

export const createComment = (content: string) => async (
  dispatch: (action: PostCommentsAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const currentTime = getCurrentUnixTime();
  const postID = getState().postComments.stack.top()?.postID;
  if (!user) {
    return dispatch(
      createCommentFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID) {
    return dispatch(createCommentFailure(new Error('Error occurred')));
  }
  const tempComment = {
    id: pendingCommentID,
    content,
    datePosted: currentTime,
    likes: 0,
    replies: 0,
    isLiked: false,
    user: {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
    },
  };
  dispatch(createCommentStarted(tempComment));
  try {
    await delay(3000);
    // throw new Error('dummy error');
    const commentRef = await fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .add({
        content,
        date_posted: currentTime,
        likes: 0,
        replies: 0,
        posted_by: user.id,
      });
    const newComment = {
      ...tempComment,
      id: commentRef.id,
    };
    dispatch(createCommentSuccess(newComment, postID));
  } catch (err) {
    console.log(err.message);
    dispatch(createCommentFailure(new Error('Internal server error.')));
  }
};

export const likeComment = (commentID: string) => async (
  dispatch: (action: PostCommentsAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const postID = getState().postComments.stack.top()?.postID;
  if (!user) {
    return dispatch(
      likeCommentFailure('', new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID) {
    return dispatch(likeCommentFailure('', new Error('Error occurred')));
  }
  dispatch(likeCommentStarted(commentID));
  try {
    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(commentRef);
      const newLikes = doc.data()!.likes + 1;
      trans.update(commentRef, { likes: newLikes });
      // throw new Error('dummy');
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('like_list')
        .doc(user.id);
      const like = await likeRef.get();
      if (like.exists) {
        throw new Error('Invalid operation.');
      }
      trans.set(likeRef, { c: 1 });
    });
    dispatch(likeCommentSuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(
      likeCommentFailure(commentID, new Error('Internal server error.')),
    );
  }
};

export const unlikeComment = (commentID: string) => async (
  dispatch: (action: PostCommentsAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const postID = getState().postComments.stack.top()?.postID;
  if (!user) {
    return dispatch(
      unlikeCommentFailure('', new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID) {
    return dispatch(unlikeCommentFailure('', new Error('Error occurred')));
  }
  dispatch(unlikeCommentStarted(commentID));
  try {
    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(commentRef);
      const newLikes = doc.data()!.likes - 1;
      trans.update(commentRef, { likes: newLikes });
      // throw new Error('dummy');
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('like_list')
        .doc(user.id);
      trans.delete(likeRef);
    });
    dispatch(unlikeCommentSuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(
      unlikeCommentFailure(commentID, new Error('Internal server error.')),
    );
  }
};

export const clearCreateCommentError = () => (
  dispatch: (action: PostCommentsAction) => void,
) => {
  dispatch({
    type: CLEAR_CREATE_COMMENT_ERROR,
    payload: null,
  });
};

export const clearInteractCommentError = () => (
  dispatch: (action: PostCommentsAction) => void,
) => {
  dispatch({
    type: CLEAR_INTERACT_COMMENT_ERROR,
    payload: null,
  });
};

export const pushPostLayer = (postID: string) => (
  dispatch: (action: PostCommentsAction) => void,
) => {
  dispatch({
    type: PUSH_POSTLAYER,
    payload: postID,
  });
};

export const popPostLayer = () => (
  dispatch: (action: PostCommentsAction) => void,
) => {
  dispatch({
    type: POP_POSTLAYER,
    payload: null,
  });
};

export const setSortComments = (by: 'new' | 'top') => (
  dispatch: (action: PostCommentsAction) => void,
) => {
  dispatch({
    type: SET_SORT_COMMENTS,
    payload: by,
  });
};

export const clearStack = () => (
  dispatch: (action: PostCommentsAction) => void,
) => {
  dispatch({
    type: CLEAR_STACK,
    payload: null,
  });
};

const fetchNewCommentsStarted = (postID: string): PostCommentsAction => ({
  type: FETCH_NEW_COMMENTS_STARTED,
  payload: postID,
});

const fetchNewCommentsEnd = (): PostCommentsAction => ({
  type: FETCH_NEW_COMMENTS_END,
  payload: null,
});

const fetchNewCommentsSuccess = (
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  commentList: Array<PostComment>,
): PostCommentsAction => ({
  type: FETCH_NEW_COMMENTS_SUCCESS,
  payload: { lastVisible, commentList },
});

const fetchNewCommentsFailure = (error: Error): PostCommentsAction => ({
  type: FETCH_NEW_COMMENTS_FAILURE,
  payload: error,
});

const fetchTopCommentsStarted = (postID: string): PostCommentsAction => ({
  type: FETCH_TOP_COMMENTS_STARTED,
  payload: postID,
});

const fetchTopCommentsEnd = (): PostCommentsAction => ({
  type: FETCH_TOP_COMMENTS_END,
  payload: null,
});

const fetchTopCommentsSuccess = (
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  commentList: Array<PostComment>,
): PostCommentsAction => ({
  type: FETCH_TOP_COMMENTS_SUCCESS,
  payload: { lastVisible, commentList },
});

const fetchTopCommentsFailure = (error: Error): PostCommentsAction => ({
  type: FETCH_TOP_COMMENTS_FAILURE,
  payload: error,
});

const createCommentStarted = (
  tempComment: PostComment,
): PostCommentsAction => ({
  type: CREATE_COMMENT_STARTED,
  payload: tempComment,
});

const createCommentSuccess = (
  newComment: PostComment,
  postID: string,
): PostCommentsAction => ({
  type: CREATE_COMMENT_SUCCESS,
  payload: { newComment, postID },
});

const createCommentFailure = (error: Error): PostCommentsAction => ({
  type: CREATE_COMMENT_FAILURE,
  payload: error,
});

const likeCommentStarted = (commentID: string): PostCommentsAction => ({
  type: LIKE_COMMENT_STARTED,
  payload: commentID,
});

const likeCommentSuccess = (): PostCommentsAction => ({
  type: LIKE_COMMENT_SUCCESS,
  payload: null,
});

const likeCommentFailure = (
  commentID: string,
  error: Error,
): PostCommentsAction => ({
  type: LIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});

const unlikeCommentStarted = (commentID: string): PostCommentsAction => ({
  type: UNLIKE_COMMENT_STARTED,
  payload: commentID,
});

const unlikeCommentSuccess = (): PostCommentsAction => ({
  type: UNLIKE_COMMENT_SUCCESS,
  payload: null,
});

const unlikeCommentFailure = (
  commentID: string,
  error: Error,
): PostCommentsAction => ({
  type: UNLIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});
