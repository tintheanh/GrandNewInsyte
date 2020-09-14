import Post from './post';
import Media from './media';
import { PlaceCategory } from './place_category';
import { FirebaseFirestoreTypes } from '../config';

export default interface PlaceStackLayer {
  placeID: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  category: PlaceCategory;
  tags: Array<String>;
  openTime: Array<String>;
  isOpen: boolean;
  error: Error | null;
  loading: boolean;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  media: Array<Media>;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  currentViewableIndex: number;
  posts: Array<Post>;
}
