import Media from './media';

export default interface Place {
  id: string;
  avatar: string;
  name: string;
  bio: string;
  category: string;
  media: Array<Media>;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
}
