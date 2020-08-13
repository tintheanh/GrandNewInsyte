import {
  Comment,
  CurrentTabScreen,
  NavigationStack,
  CommentStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SET_CURRENT_TAB = 'SET_CURRENT_TAB',
  PUSH_COMMENT_LAYER = 'PUSH_COMMENT_LAYER',
  POP_COMMENT_LAYER = 'POP_COMMENT_LAYER',
  CLEAR_STACK = 'CLEAR_STACK',
  RESET_ALL_STACKS = 'RESET_ALL_STACKS',
  INCREASE_REPLIES_BY_NUMBER = 'INCREASE_REPLIES_BY_NUMBER',
  DECREASE_REPLIES_BY_NUMBER = 'DECREASE_REPLIES_BY_NUMBER',
  CLEAR_CREATE_COMMENT_ERROR = 'CLEAR_CREATE_COMMENT_ERROR',
  CLEAR_DELETE_COMMENT_ERROR = 'CLEAR_DELETE_COMMENT_ERROR',
  CLEAR_LIKE_COMMENT_ERROR = 'CLEAR_LIKE_COMMENT_ERROR',
  CLEAR_UNLIKE_COMMENT_ERROR = 'CLEAR_UNLIKE_COMMENT_ERROR',

  FETCH_COMMENTS_STARTED = 'FETCH_COMMENTS_STARTED',
  FETCH_COMMENTS_SUCCESS = 'FETCH_COMMENTS_SUCCESS',
  FETCH_COMMENTS_FAILURE = 'FETCH_COMMENTS_FAILURE',

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
}

export interface CommentStackAction {
  type: string;
  payload:
    | string
    | Array<Comment>
    | Comment
    | {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
        comments: Array<Comment>;
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

export interface CommentStackState {
  homeTabStack: NavigationStack<CommentStackLayer>;
  userTabStack: NavigationStack<CommentStackLayer>;
  currentTab: CurrentTabScreen;
}
