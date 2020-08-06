import { DispatchTypes, CommentsStackAction } from './types';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';
import { fsDB, FirebaseFirestoreTypes, commentsPerBatch } from '../../config';
import { Comment, MyError, CurrentTabScreen, MyErrorCodes } from '../../models';
import {
  delay,
  FSdocsToCommentArray,
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
    const { currentTab } = getState().commentsStack;
    const postIDinStack = getState().commentsStack[currentTab].top()?.postID;
    if (postIDinStack !== postID) {
      throw new Error('Error occurred. Please try again.');
    }

    const lastVisible = getState().commentsStack[currentTab].top()!.lastVisible;

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
      return dispatch(fetchNewCommentsSuccess([], lastVisible));
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
      return dispatch(fetchNewCommentsSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchNewCommentsSuccess(comments, newLastVisible));
  } catch (err) {
    dispatch(
      fetchNewCommentsFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

// export const fetchTopComments = (postID: string) => async (
//   dispatch: (action: CommentsStackAction) => void,
//   getState: () => AppState,
// ) => {
//   dispatch(fetchTopCommentsStarted());
//   try {
//     // const percent = Math.floor(Math.random() * 100);
//     // if (percent > 50) {
//     //   throw new Error('dummy error');
//     // }
//     const { user } = getState().auth;
//     const { currentTab } = getState().commentsStack;
//     const lastVisible = getState().commentsStack[currentTab].top()?.lastVisible;
//     let currentUser;
//     if (user) {
//       currentUser = {
//         id: user.id,
//         avatar: user.avatar,
//         username: user.username,
//       };
//     }
//     let query: FirebaseFirestoreTypes.Query;

//     if (lastVisible === null) {
//       query = fsDB
//         .collection('posts')
//         .doc(postID)
//         .collection('comment_list')
//         .orderBy('likes', 'desc')
//         .limit(commentsPerBatch);
//     } else {
//       query = fsDB
//         .collection('posts')
//         .doc(postID)
//         .collection('comment_list')
//         .orderBy('likes', 'desc')
//         .startAfter(lastVisible)
//         .limit(commentsPerBatch);
//     }

//     const documentSnapshots = await query.get();

//     if (documentSnapshots.empty) {
//       return dispatch(fetchTopCommentsEnd());
//     }

//     const comments = await FSdocsToCommentArray(
//       postID,
//       documentSnapshots.docs,
//       currentUser,
//     );

//     if (comments.length === 0) {
//       return dispatch(fetchTopCommentsEnd());
//     }

//     const newLastVisible =
//       documentSnapshots.docs[documentSnapshots.docs.length - 1];
//     dispatch(fetchTopCommentsSuccess(newLastVisible, comments));
//   } catch (err) {
//     console.log(err.message);
//     dispatch(fetchTopCommentsFailure(new Error('Internal server error.')));
//   }
// };

// /* ------------- end fetch comments methods ------------- */

export const createComment = (postID: string, content: string) => async (
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const { currentTab } = getState().commentsStack;
  const currentTime = getCurrentUnixTime();
  const postIDinStack = getState().commentsStack[currentTab].top()?.postID;
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
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(likeCommentStarted(commentID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please try again.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { currentTab } = getState().commentsStack;
    const postIDinStack = getState().commentsStack[currentTab].top()?.postID;

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
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(unlikeCommentStarted(commentID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please try again.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { currentTab } = getState().commentsStack;
    const postIDinStack = getState().commentsStack[currentTab].top()?.postID;

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
  dispatch: (action: CommentsStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(deleteCommentStarted(commentID));
  const commentIDwithFlag = commentID + pendingDeleteCommentFlag;
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please try again.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const { currentTab } = getState().commentsStack;
    const postIDinStack = getState().commentsStack[currentTab].top()?.postID;

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

export const clearCreateCommentError = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_CREATE_COMMENT_ERROR,
    payload: null,
  });
};

export const setCurrentTabForCommentsStack = (tab: CurrentTabScreen) => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_TAB,
    payload: tab,
  });
};

export const clearDeleteCommentError = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_DELETE_COMMENT_ERROR,
    payload: null,
  });
};

export const clearLikeCommentError = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_LIKE_COMMENT_ERROR,
    payload: null,
  });
};

export const clearUnlikeCommentError = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_UNLIKE_COMMENT_ERROR,
    payload: null,
  });
};

export const pushCommentsLayer = (postID: string) => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.PUSH_COMMENTS_LAYER,
    payload: postID,
  });
};

export const popCommentsLayer = () => (
  dispatch: (action: CommentsStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.POP_COMMENTS_LAYER,
    payload: null,
  });
};

// export const setSortComments = (by: 'new' | 'top') => (
//   dispatch: (action: CommentsStackAction) => void,
// ) => {
//   dispatch({
//     type: SET_SORT_COMMENTS,
//     payload: by,
//   });
// };

// export const increaseRepliesBy = (commentID: string, by: number) => (
//   dispatch: (action: CommentsStackAction) => void,
// ) => {
//   dispatch({
//     type: INCREASE_REPLIES_BY_NUMBER,
//     payload: { commentID, by },
//   });
// };

// export const decreaseRepliesBy = (commentID: string, by: number) => (
//   dispatch: (action: CommentsStackAction) => void,
// ) => {
//   dispatch({
//     type: DECREASE_REPLIES_BY_NUMBER,
//     payload: { commentID, by },
//   });
// };

// export const clearCommentsStack = () => (
//   dispatch: (action: CommentsStackAction) => void,
// ) => {
//   dispatch({
//     type: CLEAR_STACK,
//     payload: null,
//   });
// };

// /* ----------------- comment dispatches ----------------- */

// /* --------------- fetch comments actions --------------- */

const fetchNewCommentsStarted = (): CommentsStackAction => ({
  type: DispatchTypes.FETCH_NEW_COMMENTS_STARTED,
  payload: null,
});

const fetchNewCommentsSuccess = (
  commentList: Array<Comment>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): CommentsStackAction => ({
  type: DispatchTypes.FETCH_NEW_COMMENTS_SUCCESS,
  payload: { commentList, lastVisible },
});

const fetchNewCommentsFailure = (error: Error): CommentsStackAction => ({
  type: DispatchTypes.FETCH_NEW_COMMENTS_FAILURE,
  payload: error,
});

// const fetchTopCommentsStarted = (): CommentsStackAction => ({
//   type: FETCH_TOP_COMMENTS_STARTED,
//   payload: null,
// });

// const fetchTopCommentsEnd = (): CommentsStackAction => ({
//   type: FETCH_TOP_COMMENTS_END,
//   payload: null,
// });

// const fetchTopCommentsSuccess = (
//   lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot,
//   commentList: Array<Comment>,
// ): CommentsStackAction => ({
//   type: FETCH_TOP_COMMENTS_SUCCESS,
//   payload: { lastVisible, commentList },
// });

// const fetchTopCommentsFailure = (error: Error): CommentsStackAction => ({
//   type: FETCH_TOP_COMMENTS_FAILURE,
//   payload: error,
// });

// /* ------------- end fetch comments actions ------------- */

// /* --------------- create comment actions --------------- */

const createCommentStarted = (tempComment: Comment): CommentsStackAction => ({
  type: DispatchTypes.CREATE_COMMENT_STARTED,
  payload: tempComment,
});

const createCommentSuccess = (
  newComment: Comment,
  postID: string,
): CommentsStackAction => ({
  type: DispatchTypes.CREATE_COMMENT_SUCCESS,
  payload: { newComment, postID },
});

const createCommentFailure = (error: Error): CommentsStackAction => ({
  type: DispatchTypes.CREATE_COMMENT_FAILURE,
  payload: error,
});

// /* ------------- end create comment actions ------------- */

// /* -------------- interact comment actions -------------- */

const likeCommentStarted = (commentID: string): CommentsStackAction => ({
  type: DispatchTypes.LIKE_COMMENT_STARTED,
  payload: commentID,
});

const likeCommentSuccess = (): CommentsStackAction => ({
  type: DispatchTypes.LIKE_COMMENT_SUCCESS,
  payload: null,
});

const likeCommentFailure = (
  commentID: string,
  error: Error,
): CommentsStackAction => ({
  type: DispatchTypes.LIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});

const unlikeCommentStarted = (commentID: string): CommentsStackAction => ({
  type: DispatchTypes.UNLIKE_COMMENT_STARTED,
  payload: commentID,
});

const unlikeCommentSuccess = (): CommentsStackAction => ({
  type: DispatchTypes.UNLIKE_COMMENT_SUCCESS,
  payload: null,
});

const unlikeCommentFailure = (
  commentID: string,
  error: Error,
): CommentsStackAction => ({
  type: DispatchTypes.UNLIKE_COMMENT_FAILURE,
  payload: { commentID, error },
});

// /* ------------ end interact comment actions ------------ */

// /* --------------- delete comment actions --------------- */

const deleteCommentStarted = (commentID: string): CommentsStackAction => ({
  type: DispatchTypes.DELETE_COMMENT_STARTED,
  payload: commentID,
});

const deleteCommentSuccess = (
  commentIDwithFlag: string,
): CommentsStackAction => ({
  type: DispatchTypes.DELETE_COMMENT_SUCCESS,
  payload: commentIDwithFlag,
});

const deleteCommentFailure = (
  commentIDwithFlag: string,
  error: Error,
): CommentsStackAction => ({
  type: DispatchTypes.DELETE_COMMENT_FAILURE,
  payload: { commentIDwithFlag, error },
});

// /* ------------- end delete comment actions ------------- */

// /* --------------- end comment dispatches --------------- */
