import {
  FETCH_REPLIES_END,
  FETCH_REPLIES_FAILURE,
  FETCH_REPLIES_STARTED,
  FETCH_REPLIES_SUCCESS,
  RepliesStackAction,
  SET_CURRENT_TAB,
  PUSH_REPLIES_LAYER,
  POP_REPLIES_LAYER,
  CREATE_REPLY_STARTED,
  CREATE_REPLY_SUCCESS,
  CREATE_REPLY_FAILURE,
  DELETE_REPLY_FAILURE,
  DELETE_REPLY_STARTED,
  DELETE_REPLY_SUCCESS,
  LIKE_REPLY_FAILURE,
  LIKE_REPLY_STARTED,
  LIKE_REPLY_SUCCESS,
  UNLIKE_REPLY_FAILURE,
  UNLIKE_REPLY_STARTED,
  UNLIKE_REPLY_SUCCESS,
  CLEAR_CREATE_REPLY_ERROR,
  CLEAR_DELETE_REPLY_ERROR,
  CLEAR_INTERACT_REPLY_ERROR,
  CLEAR_STACK,
} from './types';
import { Reply } from '../../models';
import {
  docFStoReplyArray,
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
    type: PUSH_REPLIES_LAYER,
    payload: { postID, commentID },
  });
};

export const popRepliesLayer = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: POP_REPLIES_LAYER,
    payload: null,
  });
};

export const setCurrentTabForRepliesStack = (
  tab: 'homeTabStack' | 'userTabStack',
) => (dispatch: (action: RepliesStackAction) => void) => {
  dispatch({
    type: SET_CURRENT_TAB,
    payload: tab,
  });
};

export const fetchReplies = (commentID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  if (!user) {
    return dispatch(
      fetchRepliesFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  const { currentTab } = getState().commentsStack;
  const postID = getState().commentsStack[currentTab].top()?.postID;
  if (!postID) {
    return dispatch(fetchRepliesFailure(new Error('Error occurred.')));
  }
  dispatch(fetchRepliesStarted());
  try {
    const lastVisible = getState().repliesStack[currentTab].top()?.lastVisible;
    const currentUser = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
    };
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
      return dispatch(fetchRepliesEnd());
    }

    const replies = await docFStoReplyArray(
      postID,
      commentID,
      documentSnapshots.docs,
      currentUser,
    );

    if (replies.length === 0) {
      return dispatch(fetchRepliesEnd());
    }

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchRepliesSuccess(newLastVisible, replies));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchRepliesFailure(err));
  }
};

export const createReply = (content: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const currentTabForComments = getState().commentsStack.currentTab;
  const currentTabForReplies = getState().repliesStack.currentTab;
  const currentTime = getCurrentUnixTime();
  const postID = getState().commentsStack[currentTabForComments].top()?.postID;
  const commentID = getState().repliesStack[currentTabForReplies].top()
    ?.commentID;
  if (!user) {
    return dispatch(
      createReplyFailure(new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID || !commentID) {
    return dispatch(createReplyFailure(new Error('Error occurred')));
  }
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
    // await delay(3000);
    // throw new Error('dummy error');

    const postRef = fsDB.collection('posts').doc(postID);
    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      const commentsDoc = await trans.get(postRef);
      const newComments = commentsDoc.data()!.comments + 1;
      trans.update(postRef, { comments: newComments });
      const repliesDoc = await trans.get(commentRef);
      const newReplies = repliesDoc.data()!.replies + 1;
      trans.update(commentRef, { replies: newReplies });
      // throw new Error('test');
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
      // throw new Error('lala');
      dispatch(createReplySuccess(newReply, commentID));
    });
  } catch (err) {
    console.log(err.message);
    dispatch(createReplyFailure(new Error('Internal server error.')));
  }
};

export const deleteReply = (replyID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const currentTabForComments = getState().commentsStack.currentTab;
  const currentTabForReplies = getState().repliesStack.currentTab;
  const postID = getState().commentsStack[currentTabForComments].top()?.postID;
  const commentID = getState().repliesStack[currentTabForReplies].top()
    ?.commentID;
  if (!user) {
    return dispatch(
      deleteReplyFailure('', new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID || !commentID) {
    return dispatch(deleteReplyFailure('', new Error('Error occurred')));
  }
  dispatch(deleteReplyStarted(replyID));
  const replyIDwithFlag = replyID + pendingDeleteReplyFlag;
  try {
    // await delay(5000);

    const postRef = fsDB.collection('posts').doc(postID);
    const commentRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID);
    await fsDB.runTransaction(async (trans) => {
      const commentsDoc = await trans.get(postRef);
      const newComments = commentsDoc.data()!.comments - 1;
      trans.update(postRef, { comments: newComments });
      const repliesDoc = await trans.get(commentRef);
      const newReplies = repliesDoc.data()!.replies - 1;
      trans.update(commentRef, { replies: newReplies });
      // throw new Error('test');
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
    console.log(err.message);
    dispatch(
      deleteReplyFailure(replyIDwithFlag, new Error('Internal server error.')),
    );
  }
};

export const likeReply = (replyID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const currentTabForComments = getState().commentsStack.currentTab;
  const currentTabForReplies = getState().repliesStack.currentTab;
  const postID = getState().commentsStack[currentTabForComments].top()?.postID;
  const commentID = getState().repliesStack[currentTabForReplies].top()
    ?.commentID;
  if (!user) {
    return dispatch(
      likeReplyFailure('', new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID || !commentID) {
    return dispatch(likeReplyFailure('', new Error('Error occurred')));
  }
  dispatch(likeReplyStarted(replyID));
  try {
    const replyRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID)
      .collection('reply_list')
      .doc(replyID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(replyRef);
      const newLikes = doc.data()!.likes + 1;
      trans.update(replyRef, { likes: newLikes });
      // throw new Error('dummy');
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
      if (like.exists) {
        throw new Error('Invalid operation.');
      }
      trans.set(likeRef, { c: 1 });
    });
    dispatch(likeReplySuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(likeReplyFailure(replyID, new Error('Internal server error.')));
  }
};

export const unlikeReply = (replyID: string) => async (
  dispatch: (action: RepliesStackAction) => void,
  getState: () => AppState,
) => {
  const { user } = getState().auth;
  const currentTabForComments = getState().commentsStack.currentTab;
  const currentTabForReplies = getState().repliesStack.currentTab;
  const postID = getState().commentsStack[currentTabForComments].top()?.postID;
  const commentID = getState().repliesStack[currentTabForReplies].top()
    ?.commentID;
  if (!user) {
    return dispatch(
      unlikeReplyFailure('', new Error('Unauthorized. Please sign in.')),
    );
  }
  if (!postID || !commentID) {
    return dispatch(unlikeReplyFailure('', new Error('Error occurred')));
  }
  dispatch(unlikeReplyStarted(replyID));
  try {
    const replyRef = fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .doc(commentID)
      .collection('reply_list')
      .doc(replyID);
    await fsDB.runTransaction(async (trans) => {
      const doc = await trans.get(replyRef);
      const newLikes = doc.data()!.likes - 1;
      trans.update(replyRef, { likes: newLikes });
      // throw new Error('dummy');
      const likeRef = fsDB
        .collection('posts')
        .doc(postID)
        .collection('comment_list')
        .doc(commentID)
        .collection('reply_list')
        .doc(replyID)
        .collection('like_list')
        .doc(user.id);
      trans.delete(likeRef);
    });
    dispatch(unlikeReplySuccess());
  } catch (err) {
    console.log(err.message);
    dispatch(unlikeReplyFailure(replyID, new Error('Internal server error.')));
  }
};

export const clearCreateReplyError = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: CLEAR_CREATE_REPLY_ERROR,
    payload: null,
  });
};

export const clearDeleteReplyError = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: CLEAR_DELETE_REPLY_ERROR,
    payload: null,
  });
};

export const clearInteractReplyError = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: CLEAR_INTERACT_REPLY_ERROR,
    payload: null,
  });
};

export const clearRepliesStack = () => (
  dispatch: (action: RepliesStackAction) => void,
) => {
  dispatch({
    type: CLEAR_STACK,
    payload: null,
  });
};

/* ------------------ reply dispatches ------------------ */

/* -------------- fetch replies actions -------------- */

const fetchRepliesStarted = (): RepliesStackAction => ({
  type: FETCH_REPLIES_STARTED,
  payload: null,
});

const fetchRepliesEnd = (): RepliesStackAction => ({
  type: FETCH_REPLIES_END,
  payload: null,
});

const fetchRepliesSuccess = (
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  replyList: Array<Reply>,
): RepliesStackAction => ({
  type: FETCH_REPLIES_SUCCESS,
  payload: { lastVisible, replyList },
});

const fetchRepliesFailure = (error: Error): RepliesStackAction => ({
  type: FETCH_REPLIES_FAILURE,
  payload: error,
});

const createReplyStarted = (tempRely: Reply): RepliesStackAction => ({
  type: CREATE_REPLY_STARTED,
  payload: tempRely,
});

/* ------------ end fetch replies actions ------------ */

/* ----------- create/delete reply actions ----------- */

const createReplySuccess = (
  newReply: Reply,
  commentID: string,
): RepliesStackAction => ({
  type: CREATE_REPLY_SUCCESS,
  payload: { newReply, commentID },
});

const createReplyFailure = (error: Error): RepliesStackAction => ({
  type: CREATE_REPLY_FAILURE,
  payload: error,
});

const deleteReplyStarted = (replyID: string): RepliesStackAction => ({
  type: DELETE_REPLY_STARTED,
  payload: replyID,
});

const deleteReplySuccess = (replyIDwithFlag: string): RepliesStackAction => ({
  type: DELETE_REPLY_SUCCESS,
  payload: replyIDwithFlag,
});

const deleteReplyFailure = (
  replyIDwithFlag: string,
  error: Error,
): RepliesStackAction => ({
  type: DELETE_REPLY_FAILURE,
  payload: { replyIDwithFlag, error },
});

/* --------- end create/delete reply actions --------- */

/* -------------- interact reply actions ------------- */

const likeReplyStarted = (replyID: string): RepliesStackAction => ({
  type: LIKE_REPLY_STARTED,
  payload: replyID,
});

const likeReplySuccess = (): RepliesStackAction => ({
  type: LIKE_REPLY_SUCCESS,
  payload: null,
});

const likeReplyFailure = (
  replyID: string,
  error: Error,
): RepliesStackAction => ({
  type: LIKE_REPLY_FAILURE,
  payload: { replyID, error },
});

const unlikeReplyStarted = (replyID: string): RepliesStackAction => ({
  type: UNLIKE_REPLY_STARTED,
  payload: replyID,
});

const unlikeReplySuccess = (): RepliesStackAction => ({
  type: UNLIKE_REPLY_SUCCESS,
  payload: null,
});

const unlikeReplyFailure = (
  replyID: string,
  error: Error,
): RepliesStackAction => ({
  type: UNLIKE_REPLY_FAILURE,
  payload: { replyID, error },
});

/* ------------ end interact reply actions ----------- */

/* ---------------- end reply dispatches ---------------- */
