import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import authentication, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import database, {
  FirebaseDatabaseTypes,
} from '@react-native-firebase/database';
import functions from '@react-native-firebase/functions';
import { GeoFirestore } from 'geofirestore';

import faker from 'faker';

export const fsDB = firestore();
export const fbDB = database();
export const fireStorage = storage();
export const auth = authentication();
export const fireFuncs = functions();

export const geofirestore = new GeoFirestore(firestore() as any);

export enum HttpsCallableMethods {
  checkUsername = 'checkUsername',
}

export const GeoPoint = firestore.GeoPoint;

const generateSubstringForUsername = (username: string) => {
  const toLower = username.toLocaleLowerCase();
  const result = new Set<string>();
  const len = toLower.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len + 1; j++) {
      result.add(toLower.slice(i, j));
    }
  }
  return [...result];
};

const locations = [
  {
    lat: 37.335648,
    lng: -121.890223,
  },
  {
    lat: 37.337311,
    lng: -121.889719,
  },
  {
    lat: 37.33840708,
    lng: -121.91704539,
  },
  {
    lat: 37.29844706,
    lng: -121.70832986,
  },
  {
    lat: 37.35174021,
    lng: -122.04579241,
  },
  {
    lat: 37.42332244,
    lng: -121.98755487,
  },
  {
    lat: 37.35699005,
    lng: -121.98755487,
  },
  {
    lat: 37.21944548,
    lng: -121.78175058,
  },
  {
    lat: 37.46681592,
    lng: -121.94437714,
  },
  {
    lat: 37.36366123,
    lng: -122.00744908,
  },
  {
    lat: 37.19599789,
    lng: -121.84223404,
  },
  {
    lat: 37.34183172,
    lng: -121.71869493,
  },
  {
    lat: 37.1949426,
    lng: -121.88113398,
  },
  {
    lat: 37.33413056,
    lng: -121.70740939,
  },
  {
    lat: 37.46413693,
    lng: -121.82974753,
  },
  {
    lat: 37.40465147,
    lng: -121.91602273,
  },
  {
    lat: 37.22837927,
    lng: -121.82680356,
  },
  {
    lat: 37.21972124,
    lng: -121.87085224,
  },
  {
    lat: 37.41446878,
    lng: -121.93037425,
  },
  {
    lat: 37.35739999,
    lng: -121.84308861,
  },
  {
    lat: 37.25754078,
    lng: -122.00075739,
  },
  {
    lat: 37.33826903,
    lng: -122.01631531,
  },
];

// for (let i = 0; i < locations.length; i++) {
//   const location = locations[i];
//   let category = '';
//   if (i % 2 === 0) {
//     category = 'bar';
//   } else {
//     category = 'restaurant';
//   }
//   const name = faker.company.companyName();
//   const avatar = faker.image.business();
//   geofirestore.collection('places').add({
//     name,
//     bio: faker.lorem.sentence(),
//     category,
//     avatar,
//     media: [],
//     for_search: generateSubstringForUsername(name.toLowerCase()),
//     coordinates: new firestore.GeoPoint(location.lat, location.lng),
//   });
// }

// geofirestore.collection('places').add({
//   name,
//   bio: faker.lorem.sentence(),
//   category: 'bar',
//   avatar: '',
//   media: [],
//   for_search: generateSubstringForUsername(name.toLowerCase()),
//   coordinates: new firestore.GeoPoint(37.335648, -121.890223),
// });

// const query = geofirestore
//   .collection('places')
//   .where('name', '==', 'Leblanc Cafe')
//   .near({
//     center: new GeoPoint(37.334829, -121.880857),
//     radius: 10,
//   });
// query
//   .get()
//   .then((value) => {
//     value.forEach((doc) => {
//       console.log(doc.data());
//     });
//   })
//   .catch((err) => console.log(err.message));

export enum AuthErrorCodes {
  UserNotFound = 'auth/user-not-found',
  WrongPassword = 'auth/wrong-password',
  UsernameAlreadyExists = 'already-exists',
  EmailAlreadyExists = 'auth/email-already-in-use',
}

export { FirebaseFirestoreTypes, FirebaseAuthTypes, FirebaseDatabaseTypes };
