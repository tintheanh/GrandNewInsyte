export default interface Place {
  id: string;
  avatar: string;
  name: string;
  bio: string;
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    width: number;
    height: number;
  }>;
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}
