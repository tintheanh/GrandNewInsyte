import { DispatchTypes, CommentStackAction } from './types';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';
import { fsDB, FirebaseFirestoreTypes, commentsPerBatch } from '../../config';
import { Comment, MyError, CurrentTabScreen, MyErrorCodes } from '../../models';
import {
  delay,
  FSdocsToCommentArray,
  getCurrentUnixTime,
} from '../../utils/functions';
import { AppState } from '../store';

/* ---------------------- utilities --------------------- */

/**
 * Method clear create comment error
 */
export const clearCreateCommentError = () => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_CREATE_COMMENT_ERROR,
    payload: null,
  });
};

/**
 * Method set current focused tab screen
 * @param tab Tab screen to set focus
 */
export const setCurrentTabForCommentStack = (tab: CurrentTabScreen) => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_TAB,
    payload: tab,
  });
};

/**
 * Method clear delete comment error
 */
export const clearDeleteCommentError = () => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_DELETE_COMMENT_ERROR,
    payload: null,
  });
};

/**
 * Method clear like comment error
 */
export const clearLikeCommentError = () => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_LIKE_COMMENT_ERROR,
    payload: null,
  });
};

/**
 * Method clear unlike comment error
 */
export const clearUnlikeCommentError = () => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_UNLIKE_COMMENT_ERROR,
    payload: null,
  });
};

/**
 * Method push new reply layer before navigating to a new post screen
 * @param postID Comment's ID acts as identifier of each layer
 */
export const pushCommentLayer = (postID: string) => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.PUSH_COMMENT_LAYER,
    payload: postID,
  });
};

/**
 * Method pop reply layer when going back
 */
export const popCommentLayer = () => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.POP_COMMENT_LAYER,
    payload: null,
  });
};

export const increaseRepliesBy = (
  commentID: string,
  numberOfReplies: number,
) => (dispatch: (action: CommentStackAction) => void) => {
  dispatch({
    type: DispatchTypes.INCREASE_REPLIES_BY_NUMBER,
    payload: { commentID, numberOfReplies },
  });
};

export const decreaseRepliesBy = (
  commentID: string,
  numberOfReplies: number,
) => (dispatch: (action: CommentStackAction) => void) => {
  dispatch({
    type: DispatchTypes.DECREASE_REPLIES_BY_NUMBER,
    payload: { commentID, numberOfReplies },
  });
};

/**
 * Method clear the stack when going back to the first screen
 */
export const clearCommentStack = () => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_STACK,
    payload: null,
  });
};

/**
 * Method reset all stacks after sign in/out
 */
export const resetAllCommentStacks = () => (
  dispatch: (action: CommentStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.RESET_ALL_STACKS,
    payload: null,
  });
};

/* -------------------- end utilities ------------------- */

/* ------------------ comments methods ------------------ */

export const fetchComments = (postID: string) => async (
  dispatch: (action: CommentStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchCommentsStarted());
  try {
    const { currentTab } = getState().commentStack;
    const postIDinStack = getState().commentStack[currentTab].top()?.postID;
    if (postIDinStack !== postID) {
      throw new Error('Error occurred. Please try again.');
    }

    const lastVisible = getState().commentStack[currentTab].top()!.lastVisible;

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
      return dispatch(fetchCommentsSuccess([], lastVisible));
    }

    const { user } = getState().auth;
    let currentUser;
    if (user) {
      currentUser = {
        id: user.id,
        avatar: user.avatar,
        username: user.username,
      };
    }
    const comments = await FSdocsToCommentArray(
      postID,
      documentSnapshots.docs,
      currentUser,
    );

    if (comments.length === 0) {
      return dispatch(fetchCommentsSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchCommentsSuccess(comments, newLastVisible));
  } catch (err) {
    dispatch(
      fetchCommentsFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

export const createComment = (postID: string, content: string) => async (
  dispatch: (action: CommentStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const { currentTab } = getState().commentStack;
  const currentTime = getCurrentUnixTime();
  const postIDinStack = getState().commentStack[currentTab].top()?.postID;
  if (!user) {
    return dispatch(
      createCommentFailure(new Error('Unauthenticated. Please sign in.')),
    );
  }
  if (postIDinStack !== postID) {
    return dispatch(createCommentFailure(new Error('Error occurred.')));
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
    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      // update comment number
      const doc = await trans.get(postRef);
      const newComments = doc.data()!.comments + 1;
      trans.update(postRef, { comments: newComments });

      // add comment to post
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

      dispatch(createCommentSuccess(newComment, postID));
    });
  } catch (err) {
    dispatch(
      createCommentFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

/**
 * Method like a comment
 * @param postID Parent post's ID for which the comment is liked
 * @param commentID Comment's ID to like
 */
export const likeComment = (postID: string, commentID: string) => async (
  dispatch: (action: CommentStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(likeCommentStarted(commentID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { currentTab } = getState().commentStack;
    const postIDinStack = getState().commentStack[currentTab].top()?.postID;

    if (postID !== postIDinStack) {
      throw new Error('Error occurred.');
    }

    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      // update like number of comment
      const doc = await trans.get(commentRef);
      const newLikes = doc.data()!.likes + 1;
      trans.update(commentRef, { likes: newLikes });

      // update like list of comment
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('like_list')
        .doc(user.id);
      const like = await likeRef.get();

      // throw error when the use already liked the comment
      if (like.exists) {
        throw new Error('Invalid operation.');
      }
      trans.set(likeRef, { c: 1 });
    });
    dispatch(likeCommentSuccess());
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(likeCommentFailure(commentID, new Error(err.message)));
      default:
        return dispatch(
          likeCommentFailure(
            commentID,
            new Error('Error occurred. Please try agaiin'),
          ),
        );
    }
  }
};

/**
 * Method unlike a comment
 * @param postID Parent post's ID for which the comment is unliked
 * @param commentID Comment's ID to unlike
 */
export const unlikeComment = (postID: string, commentID: string) => async (
  dispatch: (action: CommentStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(unlikeCommentStarted(commentID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { currentTab } = getState().commentStack;
    const postIDinStack = getState().commentStack[currentTab].top()?.postID;

    if (postID !== postIDinStack) {
      throw new Error('Error occurred.');
    }

    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      // update like number of comment
      const doc = await trans.get(commentRef);
      const newLikes = doc.data()!.likes - 1;
      trans.update(commentRef, { likes: newLikes });

      // remove use from like list of comment
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
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(
          unlikeCommentFailure(commentID, new Error(err.message)),
        );
      default:
        return dispatch(
          unlikeCommentFailure(
            commentID,
            new Error('Error occurred. Please try agaiin'),
          ),
        );
    }
  }
};

/**
 * Method delete a comment
 * @param postID Parent post's ID to delete comment from
 * @param commentID Comment's ID to delete
 * @param numberOfReplies Number of replies the deleted comment has
 */
export const deleteComment = (
  postID: string,
  commentID: string,
  numberOfReplies: number,
) => async (
  dispatch: (action: CommentStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(deleteCommentStarted(commentID));
  const commentIDwithFlag = commentID + pendingDeleteCommentFlag;
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { currentTab } = getState().commentStack;
    const postIDinStack = getState().commentStack[currentTab].top()?.postID;

    if (postID !== postIDinStack) {
      throw new Error('Error occurred');
    }

    const postRef = fsDB.collection('posts').doc(postID);
    await fsDB.runTransaction(async (trans) => {
      // decrease number of replies and the comment itself from post's comments
      const doc = await trans.get(postRef);
      const newComments = doc.data()!.comments - numberOfReplies - 1;
      trans.update(postRef, { comments: newComments });

      // delete comment from post's comment liist
      const commentRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID);
      trans.delete(commentRef);
    });
    dispatch(deleteCommentSuccess(commentIDwithFlag));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(deleteCommentFailure(commentIDwithFlag, err.message));
      default:
        return dispatch(
          deleteCommentFailure(
            commentIDwithFlag,
            new Error('Error occurred. Please try again.'),
          ),
        );
    }
  }
};

/* ---------------- end comments methods ---------------- */

/* ----------------- comment dispatches ----------------- */

/* --------------- fetch comments actions --------------- */

const fetchCommentsStarted = (): CommentStackAction => ({
  type: DispatchTypes.FETCH_COMMENTS_STARTED,
  payload: null,
});

const fetchCommentsSuccess = (
  comments: Array<Comment>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): CommentStackAction => ({
  type: DispatchTypes.FETCH_COMMENTS_SUCCESS,
  payload: { comments, lastVisible },
});

const fetchCommentsFailure = (error: Error): CommentStackAction => ({
  type: DispatchTypes.FETCH_COMMENTS_FAILURE,
  payload: error,
});

/* ------------- end fetch comments actions ------------- */

/* --------------- create comment actions --------------- */

const createCommentStarted = (tempComment: Comment): CommentStackAction => ({
  type: DispatchTypes.CREATE_COMMENT_STARTED,
  payload: tempComment,
});

const createCommentSuccess = (
  newComment: Comment,
  postID: string,
): CommentStackAction => ({
  type: DispatchTypes.CREATE_COMMENT_SUCCESS,
  payload: { newComment, postID },
});

const createCommentFailure = (error: Error): CommentStackAction => ({
  type: DispatchTypes.CREATE_COMMENT_FAILURE,
  payload: error,
});

/* ------------- end create comment actions ------------- */

/* -------------- interact comment actions -------------- */

const likeCommentStarted = (commentID: string): CommentStackAction => ({
  type: DispatchTypes.LIKE_COMMENT_STARTED,
  payload: commentID,
});

const likeCommentSuccess = (): CommentStackAction => ({
  type: DispatchTypes.LIKE_COMMENT_SUCCESS,
  payload: null,
});

const likeCommentFailure = (
  commentID: string,
  error: Error,
): CommentStackAction => ({
  type: DispatchTypes.LIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});

const unlikeCommentStarted = (commentID: string): CommentStackAction => ({
  type: DispatchTypes.UNLIKE_COMMENT_STARTED,
  payload: commentID,
});

const unlikeCommentSuccess = (): CommentStackAction => ({
  type: DispatchTypes.UNLIKE_COMMENT_SUCCESS,
  payload: null,
});

const unlikeCommentFailure = (
  commentID: string,
  error: Error,
): CommentStackAction => ({
  type: DispatchTypes.UNLIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});

/* ------------ end interact comment actions ------------ */

/* --------------- delete comment actions --------------- */

const deleteCommentStarted = (commentID: string): CommentStackAction => ({
  type: DispatchTypes.DELETE_COMMENT_STARTED,
  payload: commentID,
});

const deleteCommentSuccess = (
  commentIDwithFlag: string,
): CommentStackAction => ({
  type: DispatchTypes.DELETE_COMMENT_SUCCESS,
  payload: commentIDwithFlag,
});

const deleteCommentFailure = (
  commentIDwithFlag: string,
  error: Error,
): CommentStackAction => ({
  type: DispatchTypes.DELETE_COMMENT_FAILURE,
  payload: { commentIDwithFlag, error },
});

/* ------------- end delete comment actions ------------- */

/* --------------- end comment dispatches --------------- */
