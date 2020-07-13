export default interface User {
  id: string;
  avatar: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  totalPosts: number;
}
