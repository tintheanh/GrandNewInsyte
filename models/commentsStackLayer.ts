import Comment from './comment';
import { FirebaseFirestoreTypes } from '../config';

export default interface CommentsStackLayer {
  postID: string;
  loading: boolean;
  error: Error | null;
  createCommentLoading: boolean;
  createCommentError: Error | null;
  deleteCommentError: Error | null;
  interactCommentError: Error | null;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  type: 'new' | 'top';
  commentList: Array<Comment>;
}
