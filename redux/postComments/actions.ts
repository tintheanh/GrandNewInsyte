import {
  FETCH_COMMENTS_FAILURE,
  FETCH_COMMENTS_STARTED,
  FETCH_COMMENTS_SUCCESS,
  FETCH_COMMENTS_END,
  PUSH_POSTLAYER,
  POP_POSTLAYER,
  PostCommentsAction,
} from './types';
import { fsDB, FirebaseFirestoreTypes, commentsPerBatch } from '../../config';
import { PostComment, PostStackLayer } from '../../models';
import { docFStoCommentArray } from '../../utils/functions';
import { AppState } from '../store';

export const fetchComments = (postID: string) => async (
  dispatch: (action: PostCommentsAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchCommentsStarted(postID));
  try {
    console.log('fetch comments');
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

    if (lastVisible === 0) {
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
        .where('date_posted', '<', lastVisible)
        .orderBy('date_posted')
        .limit(commentsPerBatch);
    }

    const documentSnapshots = await query.get();

    if (documentSnapshots.empty) {
      return dispatch(fetchCommentsEnd());
    }

    const comments = await docFStoCommentArray(
      documentSnapshots.docs,
      currentUser,
    );

    if (comments.length === 0) {
      return dispatch(fetchCommentsEnd());
    }

    const newLastVisible =
      comments.length > 0 ? comments[comments.length - 1].datePosted : 0;
    dispatch(fetchCommentsSuccess(newLastVisible, comments));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchCommentsFailure(new Error('Internal server error.')));
  }
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

const fetchCommentsStarted = (postID: string): PostCommentsAction => ({
  type: FETCH_COMMENTS_STARTED,
  payload: postID,
});

const fetchCommentsEnd = (): PostCommentsAction => ({
  type: FETCH_COMMENTS_END,
  payload: null,
});

const fetchCommentsSuccess = (
  lastVisible: number,
  commentList: Array<PostComment>,
): PostCommentsAction => ({
  type: FETCH_COMMENTS_SUCCESS,
  payload: { lastVisible, commentList },
});

const fetchCommentsFailure = (error: Error): PostCommentsAction => ({
  type: FETCH_COMMENTS_FAILURE,
  payload: error,
});
