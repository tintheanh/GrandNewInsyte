import { ReplyStackAction, DispatchTypes } from './types';
import { Reply, MyError, MyErrorCodes, CurrentTabScreen } from '../../models';
import {
  FSdocsToReplyArray,
  getCurrentUnixTime,
  delay,
} from '../../utils/functions';
import { AppState } from '../store';
import { pendingReplyID, pendingDeleteReplyFlag } from '../../constants';
import { FirebaseFirestoreTypes, fsDB, repliesPerBatch } from '../../config';

/* ---------------------- utilities --------------------- */

/**
 * Method push new reply layer before navigating to a new reply screen
 * @param commentID Comment's ID acts as identifier of each layer
 */
export const pushReplyLayer = (commentID: string) => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.PUSH_REPLY_LAYER,
    payload: commentID,
  });
};

/**
 * Method pop reply layer when going back
 */
export const popReplyLayer = () => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.POP_REPLY_LAYER,
    payload: null,
  });
};

/**
 * Method set current focused tab screen
 * @param tab Tab screen to set focus
 */
export const setCurrentTabForReplyStack = (tab: CurrentTabScreen) => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_TAB,
    payload: tab,
  });
};

/**
 * Method clear create reply error
 */
export const clearCreateReplyError = () => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_CREATE_REPLY_ERROR,
    payload: null,
  });
};

/**
 * Method clear delete reply error
 */
export const clearDeleteReplyError = () => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_DELETE_REPLY_ERROR,
    payload: null,
  });
};

/**
 * Method clear like reply error
 */
export const clearLikeReplyError = () => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_LIKE_REPLY_ERROR,
    payload: null,
  });
};

/**
 * Method clear unlike reply error
 */
export const clearUnlikeReplyError = () => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_UNLIKE_REPLY_ERROR,
    payload: null,
  });
};

/**
 * Method clear the stack when going back to the first screen
 */
export const clearReplyStack = () => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_STACK,
    payload: null,
  });
};

/**
 * Method reset all stacks after sign in/out
 */
export const resetAllReplyStacks = () => (
  dispatch: (action: ReplyStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.RESET_ALL_STACKS,
    payload: null,
  });
};

/* -------------------- end utilities ------------------- */

/* -------------------- reply methods ------------------- */

/**
 * Method fetch replies
 * @param commentID Parent comment's ID to which replies belong
 */
export const fetchReplies = (commentID: string) => async (
  dispatch: (action: ReplyStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchRepliesStarted());
  try {
    const currentTabForReplies = getState().replyStack.currentTab;
    const currentTabForComments = getState().commentStack.currentTab;
    const commentIDinStack = getState().replyStack[currentTabForReplies].top()
      ?.commentID;
    const postID = getState().commentStack[currentTabForComments].top()?.postID;
    if (commentID !== commentIDinStack || !postID) {
      throw new Error('Error occurred.');
    }

    const lastVisible = getState().replyStack[currentTabForReplies].top()!
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
  dispatch: (action: ReplyStackAction) => void,
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
    const currentTabForComments = getState().commentStack.currentTab;
    const currentTabForReplies = getState().replyStack.currentTab;

    const postID = getState().commentStack[currentTabForComments].top()?.postID;
    const commentIDinStack = getState().replyStack[currentTabForReplies].top()
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
  dispatch: (action: ReplyStackAction) => void,
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

    const currentTabForComments = getState().commentStack.currentTab;
    const currentTabForReplies = getState().replyStack.currentTab;
    const postID = getState().commentStack[currentTabForComments].top()?.postID;
    const commentIDinStack = getState().replyStack[currentTabForReplies].top()
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
  dispatch: (action: ReplyStackAction) => void,
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

    const currentTabForComments = getState().commentStack.currentTab;
    const currentTabForReplies = getState().replyStack.currentTab;
    const postID = getState().commentStack[currentTabForComments].top()?.postID;
    const commentIDinStack = getState().replyStack[currentTabForReplies].top()
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
  dispatch: (action: ReplyStackAction) => void,
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

    const currentTabForComments = getState().commentStack.currentTab;
    const currentTabForReplies = getState().replyStack.currentTab;
    const postID = getState().commentStack[currentTabForComments].top()?.postID;
    const commentIDinStack = getState().replyStack[currentTabForReplies].top()
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

/* ------------------ end reply methods ----------------- */

/* ------------------ reply dispatches ------------------ */

/* -------------- fetch replies actions -------------- */

const fetchRepliesStarted = (): ReplyStackAction => ({
  type: DispatchTypes.FETCH_REPLIES_STARTED,
  payload: null,
});

const fetchRepliesSuccess = (
  replies: Array<Reply>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): ReplyStackAction => ({
  type: DispatchTypes.FETCH_REPLIES_SUCCESS,
  payload: { lastVisible, replies },
});

const fetchRepliesFailure = (error: Error): ReplyStackAction => ({
  type: DispatchTypes.FETCH_REPLIES_FAILURE,
  payload: error,
});

/* ------------ end fetch replies actions ------------ */

/* ----------- create/delete reply actions ----------- */

const createReplyStarted = (tempRely: Reply): ReplyStackAction => ({
  type: DispatchTypes.CREATE_REPLY_STARTED,
  payload: tempRely,
});

const createReplySuccess = (
  newReply: Reply,
  commentID: string,
): ReplyStackAction => ({
  type: DispatchTypes.CREATE_REPLY_SUCCESS,
  payload: { newReply, commentID },
});

const createReplyFailure = (error: Error): ReplyStackAction => ({
  type: DispatchTypes.CREATE_REPLY_FAILURE,
  payload: error,
});

const deleteReplyStarted = (replyID: string): ReplyStackAction => ({
  type: DispatchTypes.DELETE_REPLY_STARTED,
  payload: replyID,
});

const deleteReplySuccess = (replyIDwithFlag: string): ReplyStackAction => ({
  type: DispatchTypes.DELETE_REPLY_SUCCESS,
  payload: replyIDwithFlag,
});

const deleteReplyFailure = (
  replyIDwithFlag: string,
  error: Error,
): ReplyStackAction => ({
  type: DispatchTypes.DELETE_REPLY_FAILURE,
  payload: { replyIDwithFlag, error },
});

/* --------- end create/delete reply actions --------- */

/* -------------- interact reply actions ------------- */

const likeReplyStarted = (replyID: string): ReplyStackAction => ({
  type: DispatchTypes.LIKE_REPLY_STARTED,
  payload: replyID,
});

const likeReplySuccess = (): ReplyStackAction => ({
  type: DispatchTypes.LIKE_REPLY_SUCCESS,
  payload: null,
});

const likeReplyFailure = (replyID: string, error: Error): ReplyStackAction => ({
  type: DispatchTypes.LIKE_REPLY_FAILURE,
  payload: { replyID, error },
});

const unlikeReplyStarted = (replyID: string): ReplyStackAction => ({
  type: DispatchTypes.UNLIKE_REPLY_STARTED,
  payload: replyID,
});

const unlikeReplySuccess = (): ReplyStackAction => ({
  type: DispatchTypes.UNLIKE_REPLY_SUCCESS,
  payload: null,
});

const unlikeReplyFailure = (
  replyID: string,
  error: Error,
): ReplyStackAction => ({
  type: DispatchTypes.UNLIKE_REPLY_FAILURE,
  payload: { replyID, error },
});

/* ------------ end interact reply actions ----------- */

/* ---------------- end reply dispatches ---------------- */
