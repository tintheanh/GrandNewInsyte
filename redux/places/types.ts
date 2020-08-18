import { Place } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  CLEAR_FETCH_PLACES_ERROR = 'CLEAR_FETCH_PLACES_ERROR',

  SEARCH_PLACES_AROUND_STARTED = 'SEARCH_PLACES_AROUND_STARTED',
  SEARCH_PLACES_AROUND_SUCCESS = 'SEARCH_PLACES_AROUND_SUCCESS',
  SEARCH_PLACES_AROUND_FAILURE = 'SEARCH_PLACES_AROUND_FAILURE',

  SEARCH_NEW_PLACES_BY_NAME_STARTED = 'SEARCH_NEW_PLACES_BY_NAME_STARTED',
  SEARCH_NEW_PLACES_BY_NAME_SUCCESS = 'SEARCH_NEW_PLACES_BY_NAME_SUCCESS',
  SEARCH_NEW_PLACES_BY_NAME_FAILURE = 'SEARCH_NEW_PLACES_BY_NAME_FAILURE',
}

export interface PlaceAction {
  type: string;
  payload:
    | Array<Place>
    | Error
    | boolean
    | {
        places: Array<Place>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      }
    | null;
}

export interface PlaceState {
  places: Array<Place>;
  error: Error | null;
  loadings: {
    searchAroundLoading: boolean;
    searchByInputLoading: boolean;
  };
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
}
