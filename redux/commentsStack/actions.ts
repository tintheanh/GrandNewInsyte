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
  DELETE_COMMENT_FAILURE,
  DELETE_COMMENT_STARTED,
  DELETE_COMMENT_SUCCESS,
  PUSH_COMMENTS_LAYER,
  SET_SORT_COMMENTS,
  POP_COMMENTS_LAYER,
  SET_CURRENT_TAB,
  CLEAR_CREATE_COMMENT_ERROR,
  CLEAR_DELETE_COMMENT_ERROR,
  CLEAR_INTERACT_COMMENT_ERROR,
  INCREASE_REPLIES_BY_NUMBER,
  DECREASE_REPLIES_BY_NUMBER,
  CLEAR_STACK,
  CommentsStackAction,
} from './types';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';
import { fsDB, FirebaseFirestoreTypes, commentsPerBatch } from '../../config';
import { Comment } from '../../models';
import {
  delay,
  docFStoCommentArray,
  getCurrentUnixTime,
} from '../../utils/functions';
import { AppState } from '../store';

/* --------------- fetch comments methods --------------- */

export const fetchNewComments = (postID: string) => async (
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchNewCommentsStarted());
  try {
    // const percent = Math.floor(Math.random() * 100);
    // if (percent > 50) {
    //   throw new Error('dummy error');
    // }
    // console.log('fetch new cmt');
    const { user } = getState().auth;
    const { currentTab } = getState().commentsStack;
    const lastVisible = getState().commentsStack[currentTab].top()?.lastVisible;
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
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchTopCommentsStarted());
  try {
    // const percent = Math.floor(Math.random() * 100);
    // if (percent > 50) {
    //   throw new Error('dummy error');
    // }
    const { user } = getState().auth;
    const { currentTab } = getState().commentsStack;
    const lastVisible = getState().commentsStack[currentTab].top()?.lastVisible;
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

/* ------------- end fetch comments methods ------------- */

export const createComment = (content: string) => async (
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const { currentTab } = getState().commentsStack;
  const currentTime = getCurrentUnixTime();
  const postID = getState().commentsStack[currentTab].top()?.postID;
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
    // await delay(3000);
    // throw new Error('dummy error');

    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(postRef);
      const newComments = doc.data()!.comments + 1;
      trans.update(postRef, { comments: newComments });
      const commentRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc();
      trans.set(commentRef, {
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
      // throw new Error('lala');
      dispatch(createCommentSuccess(newComment, postID));
    });
  } catch (err) {
    console.log(err.message);
    dispatch(createCommentFailure(new Error('Internal server error.')));
  }
};

export const likeComment = (commentID: string) => async (
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const { currentTab } = getState().commentsStack;
  const postID = getState().commentsStack[currentTab].top()?.postID;
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
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const { currentTab } = getState().commentsStack;
  const postID = getState().commentsStack[currentTab].top()?.postID;
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

export const deleteComment = (
  commentID: string,
  numberOfReplies: number,
) => async (
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const { currentTab } = getState().commentsStack;
  const postID = getState().commentsStack[currentTab].top()?.postID;
  if (!user) {
    return dispatch(
      deleteCommentFailure('', new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID) {
    return dispatch(deleteCommentFailure('', new Error('Error occurred')));
  }
  dispatch(deleteCommentStarted(commentID));
  const commentIDwithFlag = commentID + pendingDeleteCommentFlag;
  try {
    // await delay(5000);

    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(postRef);
      const newComments = doc.data()!.comments - numberOfReplies;
      trans.update(postRef, { comments: newComments });
      const commentRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID);
      // throw new Error('dummy');
      trans.delete(commentRef);
    });
    dispatch(deleteCommentSuccess(commentIDwithFlag));
  } catch (err) {
    console.log(err.message);
    dispatch(
      deleteCommentFailure(
        commentIDwithFlag,
        new Error('Internal server error.'),
      ),
    );
  }
};

export const clearCreateCommentError = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: CLEAR_CREATE_COMMENT_ERROR,
    payload: null,
  });
};

export const setCurrentTabForCommentsStack = (
  tab: 'homeTabStack' | 'userTabStack',
) => (dispatch: (action: CommentsStackAction) => void) => {
  dispatch({
    type: SET_CURRENT_TAB,
    payload: tab,
  });
};

export const clearDeleteCommentError = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: CLEAR_DELETE_COMMENT_ERROR,
    payload: null,
  });
};

export const clearInteractCommentError = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: CLEAR_INTERACT_COMMENT_ERROR,
    payload: null,
  });
};

export const pushCommentsLayer = (postID: string) => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: PUSH_COMMENTS_LAYER,
    payload: postID,
  });
};

export const popCommentsLayer = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: POP_COMMENTS_LAYER,
    payload: null,
  });
};

export const setSortComments = (by: 'new' | 'top') => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: SET_SORT_COMMENTS,
    payload: by,
  });
};

export const increaseRepliesBy = (commentID: string, by: number) => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: INCREASE_REPLIES_BY_NUMBER,
    payload: { commentID, by },
  });
};

export const decreaseRepliesBy = (commentID: string, by: number) => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DECREASE_REPLIES_BY_NUMBER,
    payload: { commentID, by },
  });
};

export const clearCommentsStack = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: CLEAR_STACK,
    payload: null,
  });
};

/* ----------------- comment dispatches ----------------- */

/* --------------- fetch comments actions --------------- */

const fetchNewCommentsStarted = (): CommentsStackAction => ({
  type: FETCH_NEW_COMMENTS_STARTED,
  payload: null,
});

const fetchNewCommentsEnd = (): CommentsStackAction => ({
  type: FETCH_NEW_COMMENTS_END,
  payload: null,
});

const fetchNewCommentsSuccess = (
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  commentList: Array<Comment>,
): CommentsStackAction => ({
  type: FETCH_NEW_COMMENTS_SUCCESS,
  payload: { lastVisible, commentList },
});

const fetchNewCommentsFailure = (error: Error): CommentsStackAction => ({
  type: FETCH_NEW_COMMENTS_FAILURE,
  payload: error,
});

const fetchTopCommentsStarted = (): CommentsStackAction => ({
  type: FETCH_TOP_COMMENTS_STARTED,
  payload: null,
});

const fetchTopCommentsEnd = (): CommentsStackAction => ({
  type: FETCH_TOP_COMMENTS_END,
  payload: null,
});

const fetchTopCommentsSuccess = (
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  commentList: Array<Comment>,
): CommentsStackAction => ({
  type: FETCH_TOP_COMMENTS_SUCCESS,
  payload: { lastVisible, commentList },
});

const fetchTopCommentsFailure = (error: Error): CommentsStackAction => ({
  type: FETCH_TOP_COMMENTS_FAILURE,
  payload: error,
});

/* ------------- end fetch comments actions ------------- */

/* --------------- create comment actions --------------- */

const createCommentStarted = (tempComment: Comment): CommentsStackAction => ({
  type: CREATE_COMMENT_STARTED,
  payload: tempComment,
});

const createCommentSuccess = (
  newComment: Comment,
  postID: string,
): CommentsStackAction => ({
  type: CREATE_COMMENT_SUCCESS,
  payload: { newComment, postID },
});

const createCommentFailure = (error: Error): CommentsStackAction => ({
  type: CREATE_COMMENT_FAILURE,
  payload: error,
});

/* ------------- end create comment actions ------------- */

/* -------------- interact comment actions -------------- */

const likeCommentStarted = (commentID: string): CommentsStackAction => ({
  type: LIKE_COMMENT_STARTED,
  payload: commentID,
});

const likeCommentSuccess = (): CommentsStackAction => ({
  type: LIKE_COMMENT_SUCCESS,
  payload: null,
});

const likeCommentFailure = (
  commentID: string,
  error: Error,
): CommentsStackAction => ({
  type: LIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});

const unlikeCommentStarted = (commentID: string): CommentsStackAction => ({
  type: UNLIKE_COMMENT_STARTED,
  payload: commentID,
});

const unlikeCommentSuccess = (): CommentsStackAction => ({
  type: UNLIKE_COMMENT_SUCCESS,
  payload: null,
});

const unlikeCommentFailure = (
  commentID: string,
  error: Error,
): CommentsStackAction => ({
  type: UNLIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});

/* ------------ end interact comment actions ------------ */

/* --------------- delete comment actions --------------- */

const deleteCommentStarted = (commentID: string): CommentsStackAction => ({
  type: DELETE_COMMENT_STARTED,
  payload: commentID,
});

const deleteCommentSuccess = (
  commentIDwithFlag: string,
): CommentsStackAction => ({
  type: DELETE_COMMENT_SUCCESS,
  payload: commentIDwithFlag,
});

const deleteCommentFailure = (
  commentIDwithFlag: string,
  error: Error,
): CommentsStackAction => ({
  type: DELETE_COMMENT_FAILURE,
  payload: { commentIDwithFlag, error },
});

/* ------------- end delete comment actions ------------- */

/* --------------- end comment dispatches --------------- */
