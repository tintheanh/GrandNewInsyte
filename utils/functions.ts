import moment from 'moment';
import { Alert } from 'react-native';
import {
  fsDB,
  auth,
  FirebaseAuthTypes,
  FirebaseFirestoreTypes,
} from '../config';

const alertDialog = (alertText: string) => {
  Alert.alert(
    '',
    alertText,
    [
      {
        text: 'OK',
        style: 'cancel',
      },
    ],
    { cancelable: true },
  );
};

const emailValidate = (email: string) => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isValid = regex.test(String(email).toLowerCase());
  return !isValid ? 'Email is invalid.' : '';
};

const passwordValidate = (password: string) => {
  return password.length < 6 ? 'Password must be at least 6 characters.' : '';
};

const convertTime = (unix: number) => {
  const relative = moment
    .unix(parseInt((unix / 1000).toFixed(0), 10))
    .fromNow();

  if (relative === 'a few seconds ago') {
    return 'Just now';
  }

  if (relative.includes('a minute')) {
    return '1m';
  }

  if (relative.includes('an hour')) {
    return '1h';
  }

  if (relative.includes('a day')) {
    return '1d';
  }

  if (relative.includes('a month')) {
    return '1mo';
  }

  if (relative.includes('a year')) {
    return '1y';
  }

  const split = relative.split(' ');
  if (relative.includes('minutes')) {
    return `${split[0]}m`;
  }

  if (relative.includes('hours')) {
    return `${split[0]}hr`;
  }

  if (relative.includes('days')) {
    return `${split[0]}d`;
  }

  if (relative.includes('months')) {
    return `${split[0]}mo`;
  }
  return `${split[0]}y`;
};

const getCurrentUnixTime = () => {
  return moment().valueOf();
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const convertNumber = (num: number) => {
  if (num < 1000) {
    return `${num}`;
  }
  return `${(num / 1000).toFixed(1)}k`;
};

const fetchUser = async (uid: string) => {
  try {
    const userRef = await fsDB.collection('users').doc(uid).get();
    if (userRef.exists) {
      const userData = userRef.data();
      const user = {
        id: uid,
        avatar: userData!.avatar as string,
        email: '',
        name: userData!.name as string,
        username: userData!.username as string,
        bio: userData!.bio as string,
        followers: userData!.followers as number,
        following: userData!.following as number,
        totalPosts: userData!.total_posts as number,
      };
      // if (user.totalPosts !== 0) {
      //   const querySnapshot = await fsDB.collection('posts').get();
      //   const posts = [];
      //   querySnapshot.forEach(doc => {
      //     posts.push({

      //     })
      //   })
      // }
      return user;
    } else {
      const err = new Error('User not found.');
      (err as any).code = 'my-custom-error/user-not-found';
      (err as any).idNotFound = uid;
      throw err;
    }
  } catch (err) {
    if (err.code === 'my-custom-error/user-not-found') {
      throw err;
    }
    const myErr = new Error(err.message);
    (myErr as any).code = 'my-custom-error/firestore-off';
    throw myErr;
  }
};

// TODO should be array of posts
const checkPostListChanged = (list1: Array<any>, list2: Array<any>) => {
  if (list1.length !== list2.length) {
    return true;
  }

  for (let i = 0; i < list1.length; i++) {
    const p1 = list1[i];
    const p2 = list2[i];

    if (p1.likes !== p2.likes || p1.comments !== p2.comments) {
      return true;
    }
    if (p1.user.avatar !== p2.user.avatar) {
      return true;
    }
  }

  return false;
};

const getCurrentUser = () => {
  return new Promise<FirebaseAuthTypes.User | null>((resolve, _) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

const docFStoPostArray = async (
  docs: Array<FirebaseFirestoreTypes.QueryDocumentSnapshot>,
) => {
  const newPosts = [];

  for (const doc of docs) {
    const postData = doc.data();
    try {
      const userRef = await fsDB
        .collection('users')
        .doc(postData.posted_by)
        .get();

      if (!userRef.exists) {
        continue;
      }

      const userData = userRef.data();
      const post = {
        id: doc.id,
        user: {
          username: userData!.username,
          avatar: userData!.avatar,
        },
        caption: postData!.caption,
        date_posted: postData!.date_posted,
        likes: postData!.num_likes,
        comments: 0,
        media: postData!.media,
        privacy: postData!.privacy,
      };
      newPosts.push(post);
    } catch (err) {
      continue;
    }
  }
  return newPosts;
};

export {
  emailValidate,
  passwordValidate,
  convertTime,
  convertNumber,
  fetchUser,
  delay,
  getCurrentUser,
  getCurrentUnixTime,
  checkPostListChanged,
  docFStoPostArray,
  alertDialog,
};
