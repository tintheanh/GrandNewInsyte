import { DispatchTypes, PlaceAction, PlaceState } from './types';
import { FirebaseFirestoreTypes } from '../../config';
import { Place } from '../../models';

const initialState: PlaceState = {
  results: {
    surroundPlaces: [],
    placeList: [],
  },
  error: null,
  loadings: {
    searchAroundLoading: false,
    searchByInputLoading: false,
    searchMoreByInputLoading: false,
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
    case DispatchTypes.CLEAR_PLACE_LIST: {
      const newState = { ...state };
      newState.results.placeList = [];
      return newState;
    }
    case DispatchTypes.CLEAR_SURROUND_PLACES: {
      const newState = { ...state };
      newState.results.surroundPlaces = [];
      return newState;
    }
    case DispatchTypes.SELECT_PLACE_FROM_PLACE_LIST: {
      const newState = { ...state };
      const onePlace = [];
      onePlace.push(action.payload as Place);
      newState.results.surroundPlaces = onePlace;
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
      newState.results.surroundPlaces = action.payload as Array<Place>;
      return newState;
    }
    case DispatchTypes.SEARCH_PLACES_AROUND_FAILURE: {
      const newState = { ...state };
      newState.loadings.searchAroundLoading = false;
      newState.error = action.payload as Error;
      newState.results.surroundPlaces = [];
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
      newState.results.placeList = payload.places;
      newState.lastVisible = payload.lastVisible;
      newState.error = null;
      return newState;
    }
    case DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_FAILURE: {
      const newState = { ...state };
      newState.error = action.payload as Error;
      newState.loadings.searchByInputLoading = false;
      newState.results.placeList = [];
      return newState;
    }
    case DispatchTypes.SEARCH_MORE_PLACES_BY_NAME_STARTED: {
      const newState = { ...state };
      newState.loadings.searchMoreByInputLoading = true;
      return newState;
    }
    case DispatchTypes.SEARCH_MORE_PLACES_BY_NAME_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        places: Array<Place>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      newState.loadings.searchMoreByInputLoading = false;
      newState.results.placeList = newState.results.placeList.concat(
        payload.places,
      );
      newState.lastVisible = payload.lastVisible;
      newState.error = null;
      return newState;
    }
    case DispatchTypes.SEARCH_MORE_PLACES_BY_NAME_FAILURE: {
      const newState = { ...state };
      newState.error = action.payload as Error;
      newState.loadings.searchMoreByInputLoading = false;
      newState.results.placeList = [];
      return newState;
    }
    case DispatchTypes.SEARCH_PLACES_AROUND_BY_CATEGORY_STARTED: {
      const newState = { ...state };
      newState.loadings.searchByInputLoading = true;
      return newState;
    }
    case DispatchTypes.SEARCH_PLACES_AROUND_BY_CATEGORY_SUCCESS: {
      const newState = { ...state };
      newState.loadings.searchByInputLoading = false;
      newState.error = null;
      newState.results.surroundPlaces = action.payload as Array<Place>;
      return newState;
    }
    case DispatchTypes.SEARCH_PLACES_AROUND_BY_CATEGORY_FAILURE: {
      const newState = { ...state };
      newState.loadings.searchByInputLoading = false;
      newState.error = action.payload as Error;
      newState.results.surroundPlaces = [];
      return newState;
    }
    default:
      return state;
  }
}
