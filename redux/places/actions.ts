import { PlaceAction, DispatchTypes } from './types';
import { geofirestore, GeoPoint, fsDB } from '../../config';
import { Place, Media } from '../../models';
import { FirebaseFirestoreTypes, placeResultsPerBatch } from '../../config';
import { milesToKm, kmToMiles, delay, distance } from '../../utils/functions';
import { milesRadius, milesRadiusForCategorySearch } from '../../config';
import { AppState } from '../store';

/* -------------------- place actions ------------------- */

export const searchPlacesAround = (
  locationForSearch: {
    lat: number;
    lng: number;
  },
  currentLocation: {
    coords: { lat: number; lng: number };
    type: 'my-location' | 'default-location';
  },
) => async (dispatch: (action: PlaceAction) => void) => {
  dispatch(searchPlacesAroundStarted());
  try {
    const documentSnapshots = await geofirestore
      .collection('places')
      .near({
        center: new GeoPoint(locationForSearch.lat, locationForSearch.lng),
        radius: milesToKm(milesRadius),
      })
      .get();

    const places = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      const location = {
        lat: data.coordinates.latitude as number,
        lng: data.coordinates.longitude as number,
      };
      return {
        id: doc.id,
        avatar: data.avatar as string,
        name: data.name as string,
        bio: data.bio as string,
        category: data.category as string,
        media: data.media as Array<Media>,
        location,
        distance:
          currentLocation.type === 'my-location'
            ? distance(currentLocation.coords, location)
            : -1,
      };
    });

    places.sort((a, b) => a.distance - b.distance);

    dispatch(searchPlacesAroundSuccess(places));
  } catch (err) {
    dispatch(
      searchPlacesAroundFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

export const searchPlacesAroundByCategory = (
  category: string,
  currentLocation: {
    coords: { lat: number; lng: number };
    type: 'my-location' | 'default-location';
  },
) => async (dispatch: (action: PlaceAction) => void) => {
  dispatch(searchPlacesAroundByCategoryStarted());
  try {
    const categoryLowerCase = category.toLowerCase();
    const documentSnapshots = await geofirestore
      .collection('places')
      .where('category', '==', categoryLowerCase)
      .near({
        center: new GeoPoint(
          currentLocation.coords.lat,
          currentLocation.coords.lng,
        ),
        radius: milesToKm(milesRadiusForCategorySearch),
      })
      .get();

    const places = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      const location = {
        lat: data.coordinates.latitude as number,
        lng: data.coordinates.longitude as number,
      };
      return {
        id: doc.id,
        avatar: data.avatar as string,
        name: data.name as string,
        bio: data.bio as string,
        category: data.category as string,
        media: data.media as Array<Media>,
        location,
        distance:
          currentLocation.type === 'my-location'
            ? distance(currentLocation.coords, location)
            : -1,
      };
    });

    places.sort((a, b) => a.distance - b.distance);

    dispatch(searchPlacesAroundByCategorySuccess(places));
  } catch (err) {
    dispatch(
      searchPlacesAroundByCategoryFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

export const searchNewPlacesByName = (
  searchQuery: string,
  currentLocation: {
    coords: { lat: number; lng: number };
    type: 'my-location' | 'default-location';
  },
) => async (dispatch: (action: PlaceAction) => void) => {
  dispatch(searchNewPlacesByNameStarted());
  try {
    const searchQueryLowerCase = searchQuery.toLowerCase();
    const documentSnapshots = await fsDB
      .collection('places')
      .where('for_search', 'array-contains', searchQueryLowerCase)
      .orderBy('name')
      .limit(placeResultsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(searchNewPlacesByNameSuccess([], null));
    }

    const places = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      const location = {
        lat: data.coordinates.latitude as number,
        lng: data.coordinates.longitude as number,
      };
      return {
        id: doc.id,
        avatar: data.avatar as string,
        name: data.name as string,
        bio: data.bio as string,
        category: data.category as string,
        media: data.media as Array<Media>,
        location,
        distance:
          currentLocation.type === 'my-location'
            ? distance(currentLocation.coords, location)
            : -1,
      };
    });

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(searchNewPlacesByNameSuccess(places, newLastVisible));
  } catch (err) {
    dispatch(
      searchNewPlacesByNameFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

export const searchMorePlacesByName = (
  searchQuery: string,
  currentLocation: {
    coords: { lat: number; lng: number };
    type: 'my-location' | 'default-location';
  },
) => async (
  dispatch: (action: PlaceAction) => void,
  getState: () => AppState,
) => {
  dispatch(searchMorePlacesByNameStarted());
  try {
    const { lastVisible } = getState().allPlaces;

    if (!lastVisible) {
      return searchMorePlacesByNameSuccess([], null);
    }

    const searchQueryLowerCase = searchQuery.toLowerCase();
    const documentSnapshots = await fsDB
      .collection('places')
      .where('for_search', 'array-contains', searchQueryLowerCase)
      .orderBy('name')
      .startAfter(lastVisible)
      .limit(placeResultsPerBatch)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(searchMorePlacesByNameSuccess([], null));
    }

    const places = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      const location = {
        lat: data.coordinates.latitude as number,
        lng: data.coordinates.longitude as number,
      };
      return {
        id: doc.id,
        avatar: data.avatar as string,
        name: data.name as string,
        bio: data.bio as string,
        category: data.category as string,
        media: data.media as Array<Media>,
        location,
        distance:
          currentLocation.type === 'my-location'
            ? distance(currentLocation.coords, location)
            : -1,
      };
    });

    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(searchMorePlacesByNameSuccess(places, newLastVisible));
  } catch (err) {
    dispatch(
      searchMorePlacesByNameFailure(
        new Error('Error occurred. Please try again.'),
      ),
    );
  }
};

export const clearFetchPlacesError = () => (
  dispatch: (action: PlaceAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_FETCH_PLACES_ERROR,
    payload: null,
  });
};

export const clearPlaceList = () => (
  dispatch: (action: PlaceAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_PLACE_LIST,
    payload: null,
  });
};

export const clearSurroundPlaces = () => (
  dispatch: (action: PlaceAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_SURROUND_PLACES,
    payload: null,
  });
};

export const selectPlaceFromPlaceList = (place: Place) => (
  dispatch: (action: PlaceAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SELECT_PLACE_FROM_PLACE_LIST,
    payload: place,
  });
};

/* -------------------- place actions ------------------- */

/* ------------------ place dispatches ------------------ */

const searchPlacesAroundStarted = (): PlaceAction => ({
  type: DispatchTypes.SEARCH_PLACES_AROUND_STARTED,
  payload: null,
});

const searchPlacesAroundSuccess = (places: Array<Place>): PlaceAction => ({
  type: DispatchTypes.SEARCH_PLACES_AROUND_SUCCESS,
  payload: places,
});

const searchPlacesAroundFailure = (error: Error): PlaceAction => ({
  type: DispatchTypes.SEARCH_PLACES_AROUND_FAILURE,
  payload: error,
});

const searchNewPlacesByNameStarted = (): PlaceAction => ({
  type: DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_STARTED,
  payload: null,
});

const searchNewPlacesByNameSuccess = (
  places: Array<Place>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): PlaceAction => ({
  type: DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_SUCCESS,
  payload: { places, lastVisible },
});

const searchNewPlacesByNameFailure = (error: Error): PlaceAction => ({
  type: DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_FAILURE,
  payload: error,
});

const searchMorePlacesByNameStarted = (): PlaceAction => ({
  type: DispatchTypes.SEARCH_MORE_PLACES_BY_NAME_STARTED,
  payload: null,
});

const searchMorePlacesByNameSuccess = (
  places: Array<Place>,
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): PlaceAction => ({
  type: DispatchTypes.SEARCH_MORE_PLACES_BY_NAME_SUCCESS,
  payload: { places, lastVisible },
});

const searchMorePlacesByNameFailure = (error: Error): PlaceAction => ({
  type: DispatchTypes.SEARCH_MORE_PLACES_BY_NAME_FAILURE,
  payload: error,
});

const searchPlacesAroundByCategoryStarted = (): PlaceAction => ({
  type: DispatchTypes.SEARCH_PLACES_AROUND_BY_CATEGORY_STARTED,
  payload: null,
});

const searchPlacesAroundByCategorySuccess = (
  places: Array<Place>,
): PlaceAction => ({
  type: DispatchTypes.SEARCH_PLACES_AROUND_BY_CATEGORY_SUCCESS,
  payload: places,
});

const searchPlacesAroundByCategoryFailure = (error: Error): PlaceAction => ({
  type: DispatchTypes.SEARCH_PLACES_AROUND_BY_CATEGORY_FAILURE,
  payload: error,
});

/* ---------------- end place dispatches ---------------- */
