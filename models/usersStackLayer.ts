import Post from './post';

export default interface UsersStackLayer {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  following: number;
  followers: number;
  totalPosts: number;
  isFollowed: boolean;
  error: Error | null;
  loading: boolean;
  lastVisible: number;
  currentViewableIndex: number;
  posts: Array<Post>;
}
