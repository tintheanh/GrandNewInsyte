import Reply from './reply';
import { FirebaseFirestoreTypes } from '../config';

export default interface RepliesStackLayer {
  postID: string;
  commentID: string;
  loading: boolean;
  error: Error | null;
  createReplyLoading: boolean;
  createReplyError: Error | null;
  deleteReplyError: Error | null;
  interactReplyError: Error | null;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  replyList: Array<Reply>;
}
