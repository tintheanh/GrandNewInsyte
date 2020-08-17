import { Place } from '../../models';

export enum DispatchTypes {
  FETCH_PLACES_STARTED = 'FETCH_PLACES_STARTED',
  FETCH_PLACES_SUCCESS = 'FETCH_PLACES_SUCCESS',
  FETCH_PLACES_FAILURE = 'FETCH_PLACES_FAILURE',
}

export interface PlaceAction {
  type: string;
  payload: any;
}

export interface PlaceState {
  places: Array<Place>;
  error: Error | null;
  loading: boolean;
}
