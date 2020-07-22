import {
  FETCH_NEW_COMMENTS_FAILURE,
  FETCH_NEW_COMMENTS_STARTED,
  FETCH_NEW_COMMENTS_SUCCESS,
  PostCommentsAction,
} from './types';
import { fsDB, FirebaseFirestoreTypes, commentsPerBatch } from '../../config';
import { PostComment, PostStackLayer } from '../../models';
import { docFStoCommentArray } from '../../utils/functions';
import { AppState } from '../store';

export const fetchNewComments = (postID: string) => async (
  dispatch: (action: PostCommentsAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchNewCommentsStarted(postID));
  try {
    const { user } = getState().auth;
    let currentUser;
    if (user) {
      currentUser = {
        id: user.id,
        avatar: user.avatar,
        username: user.username,
      };
    }
    const documentSnapshots = await fsDB
      .collection('posts')
      .doc(postID)
      .collection('comment_list')
      .orderBy('date_posted')
      .limit(commentsPerBatch)
      .get();

    const comments = await docFStoCommentArray(
      documentSnapshots.docs,
      currentUser,
    );

    const newLastVisible =
      comments.length > 0 ? comments[comments.length - 1].datePosted : 0;
    dispatch(fetchNewCommentsSuccess(newLastVisible, comments));
  } catch (err) {
    console.log(err.message);
    dispatch(fetchNewCommentsFailure(new Error('Internal server error.')));
  }
};

const fetchNewCommentsStarted = (postID: string): PostCommentsAction => ({
  type: FETCH_NEW_COMMENTS_STARTED,
  payload: postID,
});

const fetchNewCommentsSuccess = (
  lastVisible: number,
  commentList: Array<PostComment>,
): PostCommentsAction => ({
  type: FETCH_NEW_COMMENTS_SUCCESS,
  payload: { lastVisible, commentList },
});

const fetchNewCommentsFailure = (error: Error): PostCommentsAction => ({
  type: FETCH_NEW_COMMENTS_FAILURE,
  payload: error,
});
