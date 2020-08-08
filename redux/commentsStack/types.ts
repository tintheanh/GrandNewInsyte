import {
  Comment,
  CurrentTabScreen,
  NavigationStack,
  CommentsStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SET_CURRENT_TAB = 'SET_CURRENT_TAB',

  FETCH_NEW_COMMENTS_STARTED = 'FETCH_NEW_COMMENTS_STARTED',
  FETCH_NEW_COMMENTS_SUCCESS = 'FETCH_NEW_COMMENTS_SUCCESS',
  FETCH_NEW_COMMENTS_FAILURE = 'FETCH_NEW_COMMENTS_FAILURE',
  FETCH_NEW_COMMENTS_END = 'FETCH_NEW_COMMENTS_END',

  FETCH_TOP_COMMENTS_STARTED = 'FETCH_TOP_COMMENTS_STARTED',
  FETCH_TOP_COMMENTS_SUCCESS = 'FETCH_TOP_COMMENTS_SUCCESS',
  FETCH_TOP_COMMENTS_FAILURE = 'FETCH_TOP_COMMENTS_FAILURE',
  FETCH_TOP_COMMENTS_END = 'FETCH_TOP_COMMENTS_END',

  CREATE_COMMENT_STARTED = 'CREATE_COMMENT_STARTED',
  CREATE_COMMENT_SUCCESS = 'CREATE_COMMENT_SUCCESS',
  CREATE_COMMENT_FAILURE = 'CREATE_COMMENT_FAILURE',

  LIKE_COMMENT_STARTED = 'LIKE_COMMENT_STARTED',
  LIKE_COMMENT_SUCCESS = 'LIKE_COMMENT_SUCCESS',
  LIKE_COMMENT_FAILURE = 'LIKE_COMMENT_FAILURE',

  UNLIKE_COMMENT_STARTED = 'UNLIKE_COMMENT_STARTED',
  UNLIKE_COMMENT_SUCCESS = 'UNLIKE_COMMENT_SUCCESS',
  UNLIKE_COMMENT_FAILURE = 'UNLIKE_COMMENT_FAILURE',

  DELETE_COMMENT_STARTED = 'DELETE_COMMENT_STARTED',
  DELETE_COMMENT_SUCCESS = 'DELETE_COMMENT_SUCCESS',
  DELETE_COMMENT_FAILURE = 'DELETE_COMMENT_FAILURE',

  CLEAR_CREATE_COMMENT_ERROR = 'CLEAR_CREATE_COMMENT_ERROR',
  CLEAR_DELETE_COMMENT_ERROR = 'CLEAR_DELETE_COMMENT_ERROR',
  CLEAR_LIKE_COMMENT_ERROR = 'CLEAR_LIKE_COMMENT_ERROR',
  CLEAR_UNLIKE_COMMENT_ERROR = 'CLEAR_UNLIKE_COMMENT_ERROR',

  PUSH_COMMENTS_LAYER = 'PUSH_COMMENTS_LAYER',
  POP_COMMENTS_LAYER = 'POP_COMMENTS_LAYER',
  SET_SORT_COMMENTS = 'SET_SORT_COMMENTS',
  CLEAR_STACK = 'CLEAR_STACK',

  INCREASE_REPLIES_BY_NUMBER = 'INCREASE_REPLIES_BY_NUMBER',
  DECREASE_REPLIES_BY_NUMBER = 'DECREASE_REPLIES_BY_NUMBER',
}

export interface CommentsStackAction {
  type: string;
  payload:
    | string
    | Array<Comment>
    | Comment
    | {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
        commentList: Array<Comment>;
      }
    | {
        newComment: Comment;
        postID: string;
      }
    | {
        commentID: string;
        error: Error;
      }
    | { commentID: string; numberOfReplies: number }
    | {
        commentIDwithFlag: string;
        error: Error;
      }
    | CurrentTabScreen
    | Error
    | null;
}

// CommentsStackState is a stack because it associates with push navigation
// every navigation layer is an object of post detail pushed onto
// the current view comments stack
export interface CommentsStackState {
  homeTabStack: NavigationStack<CommentsStackLayer>;
  userTabStack: NavigationStack<CommentsStackLayer>;
  currentTab: CurrentTabScreen;
}
