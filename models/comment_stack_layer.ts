import Comment from './comment';
import { FirebaseFirestoreTypes } from '../config';

export default interface CommentsStackLayer {
  postID: string;
  errors: {
    fetchError: Error | null;
    createCommentError: Error | null;
    deleteCommentError: Error | null;
    likeCommentError: Error | null;
    unlikeCommentError: Error | null;
  };
  loadings: {
    fetchLoading: boolean;
    createCommentLoading: boolean;
  };
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  commentList: Array<Comment>;
}
