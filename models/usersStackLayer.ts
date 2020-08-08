import Post from './post';
import { FirebaseFirestoreTypes } from '../config';

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
  errors: {
    fetchError: Error | null;
    followError: Error | null;
    unfollowError: Error | null;
  };
  loading: boolean;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  currentViewableIndex: number;
  posts: Array<Post>;
}
