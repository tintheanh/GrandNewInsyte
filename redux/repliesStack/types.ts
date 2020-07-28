import { RepliesStack, Reply } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export const SET_CURRENT_TAB = 'SET_CURRENT_TAB';
export const PUSH_REPLIES_LAYER = 'PUSH_REPLIES_LAYER';
export const POP_REPLIES_LAYER = 'POP_REPLIES_LAYER';

export const FETCH_REPLIES_STARTED = 'FETCH_REPLIES_STARTED';
export const FETCH_REPLIES_SUCCESS = 'FETCH_REPLIES_SUCCESS';
export const FETCH_REPLIES_FAILURE = 'FETCH_REPLIES_FAILURE';
export const FETCH_REPLIES_END = 'FETCH_REPLIES_END';

export const CREATE_REPLY_STARTED = 'CREATE_REPLY_STARTED';
export const CREATE_REPLY_SUCCESS = 'CREATE_REPLY_SUCCESS';
export const CREATE_REPLY_FAILURE = 'CREATE_REPLY_FAILURE';

export const CLEAR_CREATE_REPLY_ERROR = 'CLEAR_CREATE_REPLY_ERROR';
export const CLEAR_DELETE_REPLY_ERROR = 'CLEAR_DELETE_REPLY_ERROR';
export const CLEAR_INTERACT_REPLY_ERROR = 'CLEAR_INTERACT_REPLY_ERROR';

export const CLEAR_STACK = 'CLEAR_STACK';

export interface RepliesStackAction {
  type: string;
  payload:
    | string
    | Array<Reply>
    | Reply
    | {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
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
    | CurrentTab
    | Error
    | null;
}

export type CurrentTab = 'homeTabStack' | 'userTabStack';

export interface RepliesStackState {
  homeTabStack: RepliesStack;
  userTabStack: RepliesStack;
  currentTab: CurrentTab;
}
