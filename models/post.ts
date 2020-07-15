export default interface Post {
  id: string;
  caption: string;
  datePosted: number;
  likes: number;
  comments: number;
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    width: number;
    height: number;
  }>;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
  privacy: 'public' | 'followers';
}
