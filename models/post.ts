import Media from './media';

export default interface Post {
  id: string;
  caption: string;
  datePosted: number;
  timeLabel: string;
  likes: number;
  comments: number;
  media: Array<Media>;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
  taggedUsers: Array<string>;
  isLiked: boolean;
  privacy: 'public' | 'followers' | 'private';
}
