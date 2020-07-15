import moment from 'moment';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import {
  fsDB,
  auth,
  fireStorage,
  FirebaseAuthTypes,
  FirebaseFirestoreTypes,
} from '../config';
import { Post } from '../models';

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
  const relative = moment.unix(Math.floor(unix / 1000)).fromNow();

  // console.log(relative);

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

const checkPostListChanged = (list1: Array<Post>, list2: Array<Post>) => {
  if (list1.length !== list2.length) {
    return true;
  }

  for (let i = 0; i < list1.length; i++) {
    const p1 = list1[i];
    const p2 = list2[i];

    if (
      p1.id !== p2.id ||
      p1.caption !== p2.caption ||
      p1.likes !== p2.likes ||
      p1.comments !== p2.comments
    ) {
      return true;
    }
    if (p1.user.avatar !== p2.user.avatar) {
      return true;
    }
  }

  return false;
};

const getCurrentUser = () => {
  return new Promise<FirebaseAuthTypes.User | null>((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

const docFStoPostArray = async (
  docs: Array<FirebaseFirestoreTypes.QueryDocumentSnapshot>,
  currentUser?: {
    id: string | undefined;
    username: string | undefined;
    avatar: string | undefined;
  },
): Promise<Array<Post>> => {
  const newPosts = [];

  for (const doc of docs) {
    const postData = doc.data();
    let userData = null;
    try {
      if (
        currentUser &&
        currentUser.id &&
        currentUser.id === postData!.posted_by
      ) {
        userData = {
          username: currentUser.username,
          avatar: currentUser.avatar,
        };
      } else {
        const userRef = await fsDB
          .collection('users')
          .doc(postData.posted_by)
          .get();

        if (!userRef.exists) {
          continue;
        }

        userData = {
          username: userRef.data()!.username,
          avatar: userRef.data()!.avatar,
        };
      }

      const post = {
        id: doc.id,
        user: {
          id: postData.posted_by,
          username: userData.username,
          avatar: userData.avatar,
        },
        caption: postData!.caption,
        datePosted: postData!.date_posted,
        likes: postData!.likes,
        comments: postData!.comments,
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

const docFBtoPostArray = async (
  docCollection: Array<string>,
  currentUser?: {
    id: string | undefined;
    username: string | undefined;
    avatar: string | undefined;
  },
): Promise<Array<Post>> => {
  const newPosts = [];
  for (const postID of docCollection) {
    try {
      const postRef = await fsDB.collection('posts').doc(postID).get();
      if (!postRef.exists) {
        continue;
      }

      const postData = postRef.data();

      let userData = null;

      if (
        currentUser &&
        currentUser.id &&
        currentUser.id === postData!.posted_by
      ) {
        userData = {
          username: currentUser.username,
          avatar: currentUser.avatar,
        };
      } else {
        const userRef = await fsDB
          .collection('users')
          .doc(postData!.posted_by)
          .get();

        if (!userRef.exists) {
          continue;
        }

        userData = {
          username: userRef.data()!.username,
          avatar: userRef.data()!.avatar,
        };
      }

      const post = {
        id: postRef.id,
        user: {
          id: postData!.posted_by,
          username: userData.username,
          avatar: userData.avatar,
        },
        caption: postData!.caption,
        datePosted: postData!.date_posted,
        likes: postData!.likes,
        comments: postData!.comments,
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

const filterImageArray = (arr: any[]) => {
  const filteredArr = arr.reduce((acc, current) => {
    const x = acc.find(
      (item: any) =>
        item.mime === current.mime &&
        item.size === current.size &&
        item.width === current.width &&
        item.height === current.height,
    );
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  return filteredArr;
};

const removeDuplicatedPostsArray = (arr: Array<Post>) => {
  const filteredArr = arr.reduce((acc: Array<Post>, current) => {
    const x = acc.find((post) => post.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  return filteredArr;
};

const uploadMedia = async (
  uid: string,
  media: Array<{
    uri: string;
    mime: string;
    size: number;
    width: number;
    height: number;
  }>,
) => {
  const uploadedMedia = [];
  for (const md of media) {
    try {
      const mediaID = uuidv4();
      const mediaRef = fireStorage.ref(`users/${uid}/post_media/${mediaID}`);
      await mediaRef.putFile(md.uri);
      const url = await mediaRef.getDownloadURL();
      const uploaded = {
        id: mediaID,
        url,
        type: (md.mime.includes('image') ? 'image' : 'video') as
          | 'image'
          | 'video',
        width: md.width,
        height: md.height,
      };
      uploadedMedia.push(uploaded);
    } catch (err) {
      continue;
    }
  }
  return uploadedMedia;
};

const deleteMedia = async (
  uid: string,
  media: Array<{
    url: string;
    id: string;
    type: string;
    width: number;
    height: number;
  }>,
) => {
  for (const md of media) {
    try {
      const mediaRef = fireStorage.ref(`users/${uid}/post_media/${md.id}`);
      await mediaRef.delete();
    } catch (err) {
      continue;
    }
  }
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
  docFBtoPostArray,
  alertDialog,
  filterImageArray,
  uploadMedia,
  deleteMedia,
  removeDuplicatedPostsArray,
};
