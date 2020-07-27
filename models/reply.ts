export default interface Reply {
  id: string;
  content: string;
  datePosted: number;
  likes: number;
  isLiked: boolean;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
}
