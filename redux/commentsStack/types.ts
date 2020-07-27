import { CommentsStack, Comment } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export const SET_CURRENT_TAB = 'SET_CURRENT_TAB';

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

export const DELETE_COMMENT_STARTED = 'DELETE_COMMENT_STARTED';
export const DELETE_COMMENT_SUCCESS = 'DELETE_COMMENT_SUCCESS';
export const DELETE_COMMENT_FAILURE = 'DELETE_COMMENT_FAILURE';

export const CLEAR_CREATE_COMMENT_ERROR = 'CLEAR_CREATE_COMMENT_ERROR';
export const CLEAR_DELETE_COMMENT_ERROR = 'CLEAR_DELETE_COMMENT_ERROR';
export const CLEAR_INTERACT_COMMENT_ERROR = 'CLEAR_INTERACT_COMMENT_ERROR';

export const PUSH_POSTLAYER = 'PUSH_POSTLAYER';
export const POP_POSTLAYER = 'POP_POSTLAYER';
export const SET_SORT_COMMENTS = 'SET_SORT_COMMENTS';
export const CLEAR_STACK = 'CLEAR_STACK';

export interface CommentsStackAction {
  type: string;
  payload:
    | string
    | Array<Comment>
    | Comment
    | {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        commentList: Array<Comment>;
      }
    | {
        newComment: Comment;
        postID: string;
      }
    | {
        commentID: string;
        error: Error | null;
      }
    | {
        commentIDwithFlag: string;
        error: Error;
      }
    | CurrentTab
    | Error
    | null;
}

export type CurrentTab = 'homeTabStack' | 'userTabStack';

// commentsStackState is a stack because it associates with push navigation
// every navigation layer is a object of post detail pushed onto
// the current view postDetails stack
export interface commentsStackState {
  homeTabStack: CommentsStack;
  userTabStack: CommentsStack;
  currentTab: CurrentTab;
}
