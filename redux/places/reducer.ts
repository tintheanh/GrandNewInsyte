import { DispatchTypes, PlaceAction, PlaceState } from './types';
import { Place } from '../../models';

const initialState: PlaceState = {
  places: [],
  error: null,
  loading: false,
};

export default function placeReducer(
  state = initialState,
  action: PlaceAction,
): PlaceState {
  switch (action.type) {
    case DispatchTypes.CLEAR_FETCH_PLACES_ERROR: {
      const newState = { ...state };
      newState.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_PLACES_STARTED: {
      const newState = { ...state };
      newState.loading = true;
      return newState;
    }
    case DispatchTypes.FETCH_PLACES_SUCCESS: {
      const newState = { ...state };
      newState.loading = false;
      newState.error = null;
      newState.places = action.payload as Array<Place>;
      return newState;
    }
    case DispatchTypes.FETCH_PLACES_FAILURE: {
      const newState = { ...state };
      newState.loading = false;
      newState.error = action.payload as Error;
      newState.places = [];
      return newState;
    }
    default:
      return state;
  }
}
