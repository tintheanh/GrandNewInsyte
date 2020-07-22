export default interface PostComment {
  id: string;
  content: string;
  datePosted: number;
  likes: number;
  replies: number;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
}
