import { DispatchTypes, PlaceAction, PlaceState } from './types';
import { FirebaseFirestoreTypes } from '../../config';
import { Place } from '../../models';

const initialState: PlaceState = {
  places: [],
  error: null,
  loadings: {
    searchAroundLoading: false,
    searchByInputLoading: false,
  },
  lastVisible: null,
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
    case DispatchTypes.SEARCH_PLACES_AROUND_STARTED: {
      const newState = { ...state };
      newState.loadings.searchAroundLoading = true;
      return newState;
    }
    case DispatchTypes.SEARCH_PLACES_AROUND_SUCCESS: {
      const newState = { ...state };
      newState.loadings.searchAroundLoading = false;
      newState.error = null;
      newState.places = action.payload as Array<Place>;
      return newState;
    }
    case DispatchTypes.SEARCH_PLACES_AROUND_FAILURE: {
      const newState = { ...state };
      newState.loadings.searchAroundLoading = false;
      newState.error = action.payload as Error;
      newState.places = [];
      return newState;
    }
    case DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_STARTED: {
      const newState = { ...state };
      newState.loadings.searchByInputLoading = true;
      return newState;
    }
    case DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        places: Array<Place>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      newState.loadings.searchByInputLoading = false;
      newState.places = payload.places;
      newState.lastVisible = payload.lastVisible;
      newState.error = null;
      return newState;
    }
    case DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_FAILURE: {
      const newState = { ...state };
      newState.error = action.payload as Error;
      newState.loadings.searchByInputLoading = false;
      newState.places = [];
      return newState;
    }
    default:
      return state;
  }
}
