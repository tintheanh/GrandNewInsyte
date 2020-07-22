import PostComment from './postComment';
import { FirebaseFirestoreTypes } from '../config';

export default interface PostStackLayer {
  postID: string;
  loading: boolean;
  error: Error | null;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  type: 'new' | 'top';
  commentList: Array<PostComment>;
}
