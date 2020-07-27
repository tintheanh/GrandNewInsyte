export default interface Comment {
  id: string;
  content: string;
  datePosted: number;
  likes: number;
  replies: number;
  isLiked: boolean;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
}
