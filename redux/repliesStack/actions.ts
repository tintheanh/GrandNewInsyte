import { RepliesStackAction, DispatchTypes } from './types';
import { Reply, MyError, MyErrorCodes } from '../../models';
import {
  FSdocsToReplyArray,
  getCurrentUnixTime,
  delay,
} from '../../utils/functions';
import { AppState } from '../store';
import { pendingReplyID, pendingDeleteReplyFlag } from '../../constants';
import { FirebaseFirestoreTypes, fsDB, repliesPerBatch } from '../../config';

export const pushRepliesLayer = (commentID: string) => (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  const { currentTab } = getState().commentsStack;
  const postID = getState().commentsStack[currentTab].top()?.postID as string;
  dispatch({
    type: DispatchTypes.PUSH_REPLIES_LAYER,
    payload: { postID, commentID },
  });
};

export const popRepliesLayer = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.POP_REPLIES_LAYER,
    payload: null,
  });
};

export const setCurrentTabForRepliesStack = (
  tab: 'homeTabStack' | 'userTabStack',
) => (dispatch: (action: RepliesStackAction) => void) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_TAB,
    payload: tab,
  });
};

export const fetchReplies = (commentID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchRepliesStarted());
  try {
    const currentTabForReplies = getState().repliesStack.currentTab;
    const currentTabForComments = getState().commentsStack.currentTab;
    const commentIDinStack = getState().repliesStack[currentTabForReplies].top()
      ?.commentID;
    const postID = getState().commentsStack[currentTabForComments].top()
      ?.postID;
    if (commentID !== commentIDinStack || !postID) {
      throw new Error('Error occurred.');
    }

    const lastVisible = getState().repliesStack[currentTabForReplies].top()!
      .lastVisible;

    let query: FirebaseFirestoreTypes.Query;
    if (lastVisible === null) {
      query = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('reply_list')
        .orderBy('date_posted')
        .limit(repliesPerBatch);
    } else {
      query = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('reply_list')
        .orderBy('date_posted')
        .startAfter(lastVisible)
        .limit(repliesPerBatch);
    }
    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchRepliesSuccess([], lastVisible));
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

    const replies = await FSdocsToReplyArray(
      postID,
      commentID,
      documentSnapshots.docs,
      currentUser,
    );

    if (replies.length === 0) {
      return dispatch(fetchRepliesSuccess([], lastVisible));
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchRepliesSuccess(replies, newLastVisible));
  } catch (err) {
    dispatch(
      fetchRepliesFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

/**
 * Method create new reply
 * @param commentID Parent comment's ID for new reply to add into
 * @param content Content of new reply
 */
export const createReply = (commentID: string, content: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return createReplyFailure(new Error('Unauthenticated. Please sign in.'));
  }

  const currentTime = getCurrentUnixTime();
  const tempReply = {
    id: pendingReplyID,
    content,
    datePosted: currentTime,
    likes: 0,
    isLiked: false,
    user: {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
    },
  };
  dispatch(createReplyStarted(tempReply));
  try {
    const currentTabForComments = getState().commentsStack.currentTab;
    const currentTabForReplies = getState().repliesStack.currentTab;

    const postID = getState().commentsStack[currentTabForComments].top()
      ?.postID;
    const commentIDinStack = getState().repliesStack[currentTabForReplies].top()
      ?.commentID;
    if (!postID || commentIDinStack !== commentID) {
      throw new Error('Error occurred.');
    }

    const postRef = fsDB.collection('posts').doc(postID);
    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      // update number of comments in post
      const commentsDoc = await trans.get(postRef);
      const newComments = commentsDoc.data()!.comments + 1;
      trans.update(postRef, { comments: newComments });

      // update number of replies in comment
      const repliesDoc = await trans.get(commentRef);
      const newReplies = repliesDoc.data()!.replies + 1;
      trans.update(commentRef, { replies: newReplies });

      // add new reply to reply list
      const replyRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('reply_list')
        .doc();
      trans.set(replyRef, {
        content,
        date_posted: currentTime,
        likes: 0,
        posted_by: user.id,
      });
      const newReply = {
        ...tempReply,
        id: replyRef.id,
      };

      dispatch(createReplySuccess(newReply, commentID));
    });
  } catch (err) {
    console.log(err.message);
    dispatch(
      createReplyFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

/**
 * Method delete a reply
 * @param commentID Parent comment's ID from which the reply is deleted
 * @param replyID Reply's ID to delete
 */
export const deleteReply = (commentID: string, replyID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(deleteReplyStarted(replyID));
  const replyIDwithFlag = replyID + pendingDeleteReplyFlag;
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const currentTabForComments = getState().commentsStack.currentTab;
    const currentTabForReplies = getState().repliesStack.currentTab;
    const postID = getState().commentsStack[currentTabForComments].top()
      ?.postID;
    const commentIDinStack = getState().repliesStack[currentTabForReplies].top()
      ?.commentID;

    if (!postID || commentIDinStack !== commentID) {
      throw new Error('Error occurred.');
    }

    const postRef = fsDB.collection('posts').doc(postID);
    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      // update number of comments in post
      const commentsDoc = await trans.get(postRef);
      const newComments = commentsDoc.data()!.comments - 1;
      trans.update(postRef, { comments: newComments });

      // update number of replies in post
      const repliesDoc = await trans.get(commentRef);
      const newReplies = repliesDoc.data()!.replies - 1;
      trans.update(commentRef, { replies: newReplies });

      // delete the reply
      const replyRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('reply_list')
        .doc(replyID);
      trans.delete(replyRef);
    });
    dispatch(deleteReplySuccess(replyIDwithFlag));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(
          deleteReplyFailure(replyIDwithFlag, new Error(err.message)),
        );
      default:
        return dispatch(
          deleteReplyFailure(replyIDwithFlag, new Error('Error occured.')),
        );
    }
  }
};

/**
 * Method like a reply
 * @param commentID Parent comment's ID from which the reply is liked
 * @param replyID Reply ID to like
 */
export const likeReply = (commentID: string, replyID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(likeReplyStarted(replyID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const currentTabForComments = getState().commentsStack.currentTab;
    const currentTabForReplies = getState().repliesStack.currentTab;
    const postID = getState().commentsStack[currentTabForComments].top()
      ?.postID;
    const commentIDinStack = getState().repliesStack[currentTabForReplies].top()
      ?.commentID;
    if (!postID || commentIDinStack !== commentID) {
      throw new Error('Error occurred');
    }

    const replyRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID)
      .collection('reply_list')
      .doc(replyID);
    await fsDB.runTransaction(async (trans) => {
      // update like number
      const doc = await trans.get(replyRef);
      const newLikes = doc.data()!.likes + 1;
      trans.update(replyRef, { likes: newLikes });

      // update like list of reply
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('reply_list')
        .doc(replyID)
        .collection('like_list')
        .doc(user.id);
      const like = await likeRef.get();

      // Error if the user already like the reply
      if (like.exists) {
        throw new Error('Invalid operation.');
      }
      trans.set(likeRef, { c: 1 });
    });
    dispatch(likeReplySuccess());
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(likeReplyFailure(replyID, new Error(err.message)));
      default:
        return dispatch(likeReplyFailure(replyID, new Error('Error occured.')));
    }
  }
};

/**
 * Method unlike a reply
 * @param commentID Parent comment's ID from which the reply is unliked
 * @param replyID Reply ID to unlike
 */
export const unlikeReply = (commentID: string, replyID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(unlikeReplyStarted(replyID));
  try {
    const { user } = getState().auth;
    if (!user) {
      throw new MyError(
        'Unauthenticated. Please sign in.',
        MyErrorCodes.NotAuthenticated,
      );
    }

    const currentTabForComments = getState().commentsStack.currentTab;
    const currentTabForReplies = getState().repliesStack.currentTab;
    const postID = getState().commentsStack[currentTabForComments].top()
      ?.postID;
    const commentIDinStack = getState().repliesStack[currentTabForReplies].top()
      ?.commentID;
    if (!postID || commentIDinStack !== commentID) {
      throw new Error('Error occurred');
    }

    const replyRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID)
      .collection('reply_list')
      .doc(replyID);
    await fsDB.runTransaction(async (trans) => {
      // update like number
      const doc = await trans.get(replyRef);
      const newLikes = doc.data()!.likes - 1;
      trans.update(replyRef, { likes: newLikes });

      // update like list of reply
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('reply_list')
        .doc(replyID)
        .collection('like_list')
        .doc(user.id);

      // remove user from like list
      trans.delete(likeRef);
    });
    dispatch(unlikeReplySuccess());
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.NotAuthenticated:
        return dispatch(unlikeReplyFailure(replyID, new Error(err.message)));
      default:
        return dispatch(
          unlikeReplyFailure(replyID, new Error('Error occured.')),
        );
    }
  }
};

export const clearCreateReplyError = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_CREATE_REPLY_ERROR,
    payload: null,
  });
};

export const clearDeleteReplyError = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_DELETE_REPLY_ERROR,
    payload: null,
  });
};

export const clearLikeReplyError = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_LIKE_REPLY_ERROR,
    payload: null,
  });
};

export const clearUnlikeReplyError = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_UNLIKE_REPLY_ERROR,
    payload: null,
  });
};

export const clearRepliesStack = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_STACK,
    payload: null,
  });
};

/* ------------------ reply dispatches ------------------ */

/* -------------- fetch replies actions -------------- */

const fetchRepliesStarted = (): RepliesStackAction => ({
  type: DispatchTypes.FETCH_REPLIES_STARTED,
  payload: null,
});

const fetchRepliesSuccess = (
  replyList: Array<Reply>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): RepliesStackAction => ({
  type: DispatchTypes.FETCH_REPLIES_SUCCESS,
  payload: { lastVisible, replyList },
});

const fetchRepliesFailure = (error: Error): RepliesStackAction => ({
  type: DispatchTypes.FETCH_REPLIES_FAILURE,
  payload: error,
});

/* ------------ end fetch replies actions ------------ */

/* ----------- create/delete reply actions ----------- */

const createReplyStarted = (tempRely: Reply): RepliesStackAction => ({
  type: DispatchTypes.CREATE_REPLY_STARTED,
  payload: tempRely,
});

const createReplySuccess = (
  newReply: Reply,
  commentID: string,
): RepliesStackAction => ({
  type: DispatchTypes.CREATE_REPLY_SUCCESS,
  payload: { newReply, commentID },
});

const createReplyFailure = (error: Error): RepliesStackAction => ({
  type: DispatchTypes.CREATE_REPLY_FAILURE,
  payload: error,
});

const deleteReplyStarted = (replyID: string): RepliesStackAction => ({
  type: DispatchTypes.DELETE_REPLY_STARTED,
  payload: replyID,
});

const deleteReplySuccess = (replyIDwithFlag: string): RepliesStackAction => ({
  type: DispatchTypes.DELETE_REPLY_SUCCESS,
  payload: replyIDwithFlag,
});

const deleteReplyFailure = (
  replyIDwithFlag: string,
  error: Error,
): RepliesStackAction => ({
  type: DispatchTypes.DELETE_REPLY_FAILURE,
  payload: { replyIDwithFlag, error },
});

/* --------- end create/delete reply actions --------- */

/* -------------- interact reply actions ------------- */

const likeReplyStarted = (replyID: string): RepliesStackAction => ({
  type: DispatchTypes.LIKE_REPLY_STARTED,
  payload: replyID,
});

const likeReplySuccess = (): RepliesStackAction => ({
  type: DispatchTypes.LIKE_REPLY_SUCCESS,
  payload: null,
});

const likeReplyFailure = (
  replyID: string,
  error: Error,
): RepliesStackAction => ({
  type: DispatchTypes.LIKE_REPLY_FAILURE,
  payload: { replyID, error },
});

const unlikeReplyStarted = (replyID: string): RepliesStackAction => ({
  type: DispatchTypes.UNLIKE_REPLY_STARTED,
  payload: replyID,
});

const unlikeReplySuccess = (): RepliesStackAction => ({
  type: DispatchTypes.UNLIKE_REPLY_SUCCESS,
  payload: null,
});

const unlikeReplyFailure = (
  replyID: string,
  error: Error,
): RepliesStackAction => ({
  type: DispatchTypes.UNLIKE_REPLY_FAILURE,
  payload: { replyID, error },
});

/* ------------ end interact reply actions ----------- */

/* ---------------- end reply dispatches ---------------- */
