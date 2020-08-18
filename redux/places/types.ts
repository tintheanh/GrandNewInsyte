import { Place } from '../../models';

export enum DispatchTypes {
  CLEAR_FETCH_PLACES_ERROR = 'CLEAR_FETCH_PLACES_ERROR',

  FETCH_PLACES_STARTED = 'FETCH_PLACES_STARTED',
  FETCH_PLACES_SUCCESS = 'FETCH_PLACES_SUCCESS',
  FETCH_PLACES_FAILURE = 'FETCH_PLACES_FAILURE',
}

export interface PlaceAction {
  type: string;
  payload: Array<Place> | Error | boolean | null;
}

export interface PlaceState {
  places: Array<Place>;
  error: Error | null;
  loading: boolean;
}
