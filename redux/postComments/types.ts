import { PostStack, PostComment } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export const FETCH_NEW_COMMENTS_STARTED = 'FETCH_NEW_COMMENTS_STARTED';
export const FETCH_NEW_COMMENTS_SUCCESS = 'FETCH_NEW_COMMENTS_SUCCESS';
export const FETCH_NEW_COMMENTS_FAILURE = 'FETCH_NEW_COMMENTS_FAILURE';
export const FETCH_NEW_COMMENTS_END = 'FETCH_NEW_COMMENTS_END';

export const FETCH_TOP_COMMENTS_STARTED = 'FETCH_TOP_COMMENTS_STARTED';
export const FETCH_TOP_COMMENTS_SUCCESS = 'FETCH_TOP_COMMENTS_SUCCESS';
export const FETCH_TOP_COMMENTS_FAILURE = 'FETCH_TOP_COMMENTS_FAILURE';
export const FETCH_TOP_COMMENTS_END = 'FETCH_TOP_COMMENTS_END';

export const CREATE_COMMENT_STARTED = 'CREATE_COMMENT_STARTED';
export const CREATE_COMMENT_SUCCESS = 'CREATE_COMMENT_SUCCESS';
export const CREATE_COMMENT_FAILURE = 'CREATE_COMMENT_FAILURE';

export const LIKE_COMMENT_STARTED = 'LIKE_COMMENT_STARTED';
export const LIKE_COMMENT_SUCCESS = 'LIKE_COMMENT_SUCCESS';
export const LIKE_COMMENT_FAILURE = 'LIKE_COMMENT_FAILURE';

export const UNLIKE_COMMENT_STARTED = 'UNLIKE_COMMENT_STARTED';
export const UNLIKE_COMMENT_SUCCESS = 'UNLIKE_COMMENT_SUCCESS';
export const UNLIKE_COMMENT_FAILURE = 'UNLIKE_COMMENT_FAILURE';

export const CLEAR_CREATE_COMMENT_ERROR = 'CLEAR_CREATE_COMMENT_ERROR';
export const CLEAR_INTERACT_COMMENT_ERROR = 'CLEAR_INTERACT_COMMENT_ERROR';

export const PUSH_POSTLAYER = 'PUSH_POSTLAYER';
export const POP_POSTLAYER = 'POP_POSTLAYER';
export const SET_SORT_COMMENTS = 'SET_SORT_COMMENTS';
export const CLEAR_STACK = 'CLEAR_STACK';

export interface PostCommentsAction {
  type: string;
  payload:
    | string
    | Array<PostComment>
    | PostComment
    | {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        commentList: Array<PostComment>;
      }
    | {
        newComment: PostComment;
        postID: string;
      }
    | {
        commentID: string;
        error: Error | null;
      }
    | Error
    | null;
}

// PostCommentsState is a stack because it associates with push navigation
// every navigation layer is a object of post detail pushed onto
// the current view postDetails stack
export interface PostCommentsState {
  stack: PostStack;
}
