import Reply from './reply';
import { FirebaseFirestoreTypes } from '../config';

export default interface ReplyStackLayer {
  commentID: string;
  loadings: {
    fetchLoading: boolean;
    createReplyLoading: boolean;
  };
  errors: {
    fetchError: Error | null;
    createReplyError: Error | null;
    deleteReplyError: Error | null;
    likeReplyError: Error | null;
    unlikeReplyError: Error | null;
  };
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  replies: Array<Reply>;
}
