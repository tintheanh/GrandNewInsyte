export default interface Post {
  id: string;
  caption: string;
  datePosted: number;
  likes: number;
  comments: number;
  media: Array<{ type: 'image' | 'video'; url: string }>;
  user: {
    avatar: string;
    username: string;
  };
  privacy: 'public' | 'followers';
}
