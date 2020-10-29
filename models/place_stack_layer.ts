import { FirebaseFirestoreTypes } from '../config';
import Place from './place';

export default interface PlaceStackLayer {
  placeID: string;
  placeData: Place;
  errors: {
    fetchError: Error | null;
    followError: Error | null;
    unfollowError: Error | null;
  };
  loading: boolean;
  lastOwnPostVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  lastCheckinPostVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  currentViewableOwnPostIndex: number;
  currentViewableCheckinPostIndex: number;
}
