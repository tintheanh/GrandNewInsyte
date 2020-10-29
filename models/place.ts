import Post from './post';
import { PlaceCategory } from './place_category';

export default interface Place {
  id: string;
  avatar: string;
  name: string;
  bio: string;
  category: PlaceCategory;
  location: {
    lat: number;
    lng: number;
  } | null;
  address: string;
  openTime: Array<string>;
  distance: number;
  isOpen: boolean;
  isFollowed: boolean;
  followers: number;
  following: number;
  totalPosts: number;
  ownPosts: Array<Post>;
  checkinPosts: Array<Post>;
}
