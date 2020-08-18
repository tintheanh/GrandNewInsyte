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

// geofirestore.collection('places').add({
//   name: 'Leblanc Cafe',
//   bio: 'new cafe in town',
//   category: 'bar',
//   avatar: '',
//   media: [],
//   for_search: generateSubstringForUsername('leblanc cafe'),
//   coordinates: new firestore.GeoPoint(37.329182, -121.9021),
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
