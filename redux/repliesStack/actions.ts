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
import { pendingReplyID } from '../../constants';
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
    console.log('fetch replies');
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
    await delay(3000);
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
