import PostComment from './postComment';
import { FirebaseFirestoreTypes } from '../config';

export default interface PostStackLayer {
  postID: string;
  loading: boolean;
  error: Error | null;
  createCommentLoading: boolean;
  createCommentError: Error | null;
  interactCommentError: Error | null;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  type: 'new' | 'top';
  commentList: Array<PostComment>;
}
