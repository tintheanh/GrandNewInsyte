import PostComment from './postComment';

export default interface PostStackLayer {
  postID: string;
  loading: boolean;
  error: Error | null;
  lastVisible: number;
  commentList: Array<PostComment>;
}
