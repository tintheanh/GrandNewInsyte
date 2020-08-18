import { PlaceAction, DispatchTypes } from './types';
import { geofirestore, GeoPoint, fsDB } from '../../config';
import { Place, Media } from '../../models';
import { FirebaseFirestoreTypes, placeResultsPerBatch } from '../../config';
import { milesToKm, kmToMiles, delay, distance } from '../../utils/functions';
import { milesRadius } from '../../config';

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
    // await delay(3000);
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

export const searchNewPlacesByName = (
  searchQuery: string,
  currentLocation: {
    coords: { lat: number; lng: number };
    type: 'my-location' | 'default-location';
  },
) => async (dispatch: (action: PlaceAction) => void) => {
  dispatch(searchNewPlacesByNameStarted());
  try {
    const documentSnapshots = await fsDB
      .collection('places')
      .where('for_search', 'array-contains', searchQuery)
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

export const clearFetchPlacesError = () => (
  dispatch: (action: PlaceAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_FETCH_PLACES_ERROR,
    payload: null,
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
  type: DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_STARTED,
  payload: { places, lastVisible },
});

const searchNewPlacesByNameFailure = (error: Error): PlaceAction => ({
  type: DispatchTypes.SEARCH_NEW_PLACES_BY_NAME_FAILURE,
  payload: error,
});

/* ---------------- end place dispatches ---------------- */
