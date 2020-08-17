export default interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  width: number;
  height: number;
}
