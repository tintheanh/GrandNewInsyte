import { RepliesStack, Reply } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export const SET_CURRENT_TAB = 'SET_CURRENT_TAB';

export interface RepliesStackAction {
  type: string;
  payload:
    | string
    | Array<Reply>
    | Reply
    | {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        commentList: Array<Reply>;
      }
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
