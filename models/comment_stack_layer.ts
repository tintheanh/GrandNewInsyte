import Comment from './comment';
import { FirebaseFirestoreTypes } from '../config';

export default interface CommentStackLayer {
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
  comments: Array<Comment>;
}
