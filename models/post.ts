export default interface Post {
  id: string;
  caption: string;
  datePosted: number;
  timeLabel: string;
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
  isLiked: boolean;
  privacy: 'public' | 'followers' | 'private';
}
