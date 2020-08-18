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
    lat: number;
    lng: number;
  };
  distance: number;
}
