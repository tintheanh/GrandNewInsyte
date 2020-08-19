import { Place } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  CLEAR_FETCH_PLACES_ERROR = 'CLEAR_FETCH_PLACES_ERROR',
  CLEAR_PLACE_LIST = 'CLEAR_PLACE_LIST',
  CLEAR_SURROUND_PLACES = 'CLEAR_SURROUND_PLACES',
  SELECT_PLACE_FROM_PLACE_LIST = 'SELECT_PLACE_FROM_PLACE_LIST',

  SEARCH_PLACES_AROUND_STARTED = 'SEARCH_PLACES_AROUND_STARTED',
  SEARCH_PLACES_AROUND_SUCCESS = 'SEARCH_PLACES_AROUND_SUCCESS',
  SEARCH_PLACES_AROUND_FAILURE = 'SEARCH_PLACES_AROUND_FAILURE',

  SEARCH_PLACES_AROUND_BY_CATEGORY_STARTED = 'SEARCH_PLACES_AROUND_BY_CATEGORY_STARTED',
  SEARCH_PLACES_AROUND_BY_CATEGORY_SUCCESS = 'SEARCH_PLACES_AROUND_BY_CATEGORY_SUCCESS',
  SEARCH_PLACES_AROUND_BY_CATEGORY_FAILURE = 'SEARCH_PLACES_AROUND_BY_CATEGORY_FAILURE',

  SEARCH_NEW_PLACES_BY_NAME_STARTED = 'SEARCH_NEW_PLACES_BY_NAME_STARTED',
  SEARCH_NEW_PLACES_BY_NAME_SUCCESS = 'SEARCH_NEW_PLACES_BY_NAME_SUCCESS',
  SEARCH_NEW_PLACES_BY_NAME_FAILURE = 'SEARCH_NEW_PLACES_BY_NAME_FAILURE',

  SEARCH_MORE_PLACES_BY_NAME_STARTED = 'SEARCH_MORE_PLACES_BY_NAME_STARTED',
  SEARCH_MORE_PLACES_BY_NAME_SUCCESS = 'SEARCH_MORE_PLACES_BY_NAME_SUCCESS',
  SEARCH_MORE_PLACES_BY_NAME_FAILURE = 'SEARCH_MORE_PLACES_BY_NAME_FAILURE',
}

export interface PlaceAction {
  type: string;
  payload:
    | Array<Place>
    | Place
    | Error
    | boolean
    | {
        places: Array<Place>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      }
    | null;
}

export interface PlaceState {
  results: {
    surroundingPlaces: Array<Place>;
    placeList: Array<Place>;
  };
  error: Error | null;
  loadings: {
    searchAroundLoading: boolean;
    searchByInputLoading: boolean;
    searchMoreByInputLoading: boolean;
  };
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
}
