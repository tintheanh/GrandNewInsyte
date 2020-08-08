import {
  Reply,
  CurrentTabScreen,
  NavigationStack,
  RepliesStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SET_CURRENT_TAB = 'SET_CURRENT_TAB',
  PUSH_REPLIES_LAYER = 'PUSH_REPLIES_LAYER',
  POP_REPLIES_LAYER = 'POP_REPLIES_LAYER',

  FETCH_REPLIES_STARTED = 'FETCH_REPLIES_STARTED',
  FETCH_REPLIES_SUCCESS = 'FETCH_REPLIES_SUCCESS',
  FETCH_REPLIES_FAILURE = 'FETCH_REPLIES_FAILURE',

  CREATE_REPLY_STARTED = 'CREATE_REPLY_STARTED',
  CREATE_REPLY_SUCCESS = 'CREATE_REPLY_SUCCESS',
  CREATE_REPLY_FAILURE = 'CREATE_REPLY_FAILURE',

  DELETE_REPLY_STARTED = 'DELETE_REPLY_STARTED',
  DELETE_REPLY_SUCCESS = 'DELETE_REPLY_SUCCESS',
  DELETE_REPLY_FAILURE = 'DELETE_REPLY_FAILURE',

  LIKE_REPLY_STARTED = 'LIKE_REPLY_STARTED',
  LIKE_REPLY_SUCCESS = 'LIKE_REPLY_SUCCESS',
  LIKE_REPLY_FAILURE = 'LIKE_REPLY_FAILURE',

  UNLIKE_REPLY_STARTED = 'UNLIKE_REPLY_STARTED',
  UNLIKE_REPLY_SUCCESS = 'UNLIKE_REPLY_SUCCESS',
  UNLIKE_REPLY_FAILURE = 'UNLIKE_REPLY_FAILURE',

  CLEAR_CREATE_REPLY_ERROR = 'CLEAR_CREATE_REPLY_ERROR',
  CLEAR_DELETE_REPLY_ERROR = 'CLEAR_DELETE_REPLY_ERROR',
  CLEAR_LIKE_REPLY_ERROR = 'CLEAR_LIKE_REPLY_ERROR',
  CLEAR_UNLIKE_REPLY_ERROR = 'CLEAR_UNLIKE_REPLY_ERROR',

  CLEAR_STACK = 'CLEAR_STACK',
}

export interface RepliesStackAction {
  type: string;
  payload:
    | string
    | Array<Reply>
    | Reply
    | {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
        replyList: Array<Reply>;
      }
    | { postID: string; commentID: string }
    | { newReply: Reply; commentID: string }
    | {
        newReply: Reply;
        commentID: string;
      }
    | {
        replyID: string;
        error: Error | null;
      }
    | {
        replyIDwithFlag: string;
        error: Error;
      }
    | CurrentTabScreen
    | Error
    | null;
}

export interface RepliesStackState {
  homeTabStack: NavigationStack<RepliesStackLayer>;
  userTabStack: NavigationStack<RepliesStackLayer>;
  currentTab: CurrentTabScreen;
}
