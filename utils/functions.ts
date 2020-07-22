import moment from 'moment';
import { Alert, Linking } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'react-native-url-polyfill';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import URI from 'urijs';
import {
  fsDB,
  auth,
  fireStorage,
  FirebaseAuthTypes,
  FirebaseFirestoreTypes,
} from '../config';
import { Post, UserResult, PostComment } from '../models';
import { Colors, tokenForTag, separatorForTag } from '../constants';

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

const checkURL = (url: string) => {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
};

const generateSubstrForUsername = (username: string) => {
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

const wrapPostCaption = (caption: string) => {
  const maxLen = 150;
  if (!caption.includes(' ')) {
    return caption.substr(0, maxLen);
  }
  return caption.substr(0, caption.lastIndexOf(' ', maxLen));
};

// const generateCaptionTextArray = (source: string) => {
//   const uniqueSeperator =
//     'Lk,dm9kb_"vor{sH{gT-F&sq-$)g&j1`$zj{*vEPBNeDhV3=>mhM7Lj:-:":O#z';

//   const res = URI.withinString(source, function (url) {
//     return uniqueSeperator + url + uniqueSeperator;
//   });
//   const splited = res.split(uniqueSeperator).filter((str) => str !== '');
//   const fin = splited.map((text) => {
//     if (checkURL(text)) {
//       return { type: 'url', value: text };
//     }
//     return { type: 'text', value: text };
//   });

//   return fin;
// };

const generateCaptionWithTagsAndUrls = (source: string) => {
  const splitted = source.split(/(?=\n)| /);
  const chunks = splitted.map((str) => {
    if (
      str.includes('@') &&
      str.includes(tokenForTag) &&
      str.includes(separatorForTag)
    ) {
      const noLinkSymbol = str.split(separatorForTag);

      return {
        type: 'tag',
        value: {
          text: noLinkSymbol[0],
          uid: noLinkSymbol[1].replace(tokenForTag, ''),
        },
      };
    }
    if (checkURL(str)) {
      return { type: 'url', value: str };
    }
    return { type: 'text', value: str };
  });
  return chunks;
};

const openURL = (url: string) => async () => {
  try {
    if (await InAppBrowser.isAvailable()) {
      InAppBrowser.close();
      await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: Colors.darkColor,
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        toolbarColor: '#6200EE',
        secondaryToolbarColor: 'black',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        headers: {
          'my-custom-header': 'my custom header value',
        },
      });
    } else {
      Linking.openURL(url);
    }
  } catch (error) {
    alertDialog(error.message);
  }
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

const checkUserResultListChanged = (
  list1: Array<UserResult>,
  list2: Array<UserResult>,
) => {
  if (list1.length !== list2.length) {
    return true;
  }

  const len = list1.length;
  for (let i = 0; i < len; i++) {
    const user1 = list1[i];
    const user2 = list2[i];

    if (
      user1.avatar !== user2.avatar ||
      user1.id !== user2.id ||
      user1.name !== user2.name ||
      user1.username !== user2.username
    ) {
      return true;
    }
  }

  return false;
};

const checkPostCommentListChanged = (
  list1: Array<PostComment>,
  list2: Array<PostComment>,
) => {
  if (list1.length !== list2.length) {
    return true;
  }

  const len = list1.length;
  for (let i = 0; i < len; i++) {
    const user1 = list1[i];
    const user2 = list2[i];

    if (user1.likes !== user2.likes || user1.replies !== user2.replies) {
      return true;
    }
  }

  return false;
};

const checkPostListChanged = (list1: Array<Post>, list2: Array<Post>) => {
  if (list1.length !== list2.length) {
    return true;
  }

  const len = list1.length;
  for (let i = 0; i < len; i++) {
    const p1 = list1[i];
    const p2 = list2[i];

    if (
      p1.isLiked !== p2.isLiked ||
      p1.timeLabel !== p2.timeLabel ||
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

const checkPostChanged = (post1: Post, post2: Post) => {
  if (
    post1.isLiked !== post2.isLiked ||
    post1.timeLabel !== post2.timeLabel ||
    post1.id !== post2.id ||
    post1.caption !== post2.caption ||
    post1.likes !== post2.likes ||
    post1.comments !== post2.comments ||
    post1.user.avatar !== post2.user.avatar
  ) {
    return true;
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
      let captionWithTags = postData!.caption;
      if (postData!.tagged_users.length > 0) {
        const taggedUsers: Array<{
          id: string;
          idWithToken: string;
          username: string;
        }> = [];
        for (const tagID of postData!.tagged_users) {
          try {
            const uTagRef = await fsDB.collection('users').doc(tagID).get();
            if (!uTagRef.exists) {
              continue;
            }
            const taggedUser = {
              id: tagID,
              idWithToken: `@${tagID}${tokenForTag}`,
              username: uTagRef.data()!.username,
            };
            taggedUsers.push(taggedUser);
          } catch (err) {
            continue;
          }
        }

        const regex = new RegExp(
          `@([^${tokenForTag}][^\n| ]*)${tokenForTag}`,
          'g',
        );

        const matches = postData!.caption.match(regex);
        if (matches) {
          for (const m of matches) {
            const index = taggedUsers.findIndex((u) =>
              u.idWithToken.includes(m),
            );
            if (index !== -1) {
              captionWithTags = captionWithTags.replace(
                m,
                `@${taggedUsers[index].username}${separatorForTag}${taggedUsers[index].id}${tokenForTag}`,
              );
            }
          }
        }
      }

      let isLiked = false;
      if (currentUser) {
        const likeRef = await fsDB
          .collection('posts')
          .doc(doc.id)
          .collection('like_list')
          .doc(currentUser.id)
          .get();
        if (likeRef.exists) {
          isLiked = true;
        }
      }

      const post = {
        id: doc.id,
        user: {
          id: postData.posted_by,
          username: userData.username,
          avatar: userData.avatar,
        },
        caption: captionWithTags,
        datePosted: postData!.date_posted,
        timeLabel: convertTime(postData!.date_posted),
        likes: postData!.likes,
        comments: postData!.comments,
        media: postData!.media,
        taggedUsers: postData!.tagged_users,
        isLiked,
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

      let captionWithTags = postData!.caption;
      if (postData!.tagged_users.length > 0) {
        const taggedUsers: Array<{
          id: string;
          idWithToken: string;
          username: string;
        }> = [];
        for (const tagID of postData!.tagged_users) {
          try {
            const uTagRef = await fsDB.collection('users').doc(tagID).get();
            if (!uTagRef.exists) {
              continue;
            }
            const taggedUser = {
              id: tagID,
              idWithToken: `@${tagID}${tokenForTag}`,
              username: uTagRef.data()!.username,
            };
            taggedUsers.push(taggedUser);
          } catch (err) {
            continue;
          }
        }

        const regex = new RegExp(
          `@([^${tokenForTag}][^\n| ]*)${tokenForTag}`,
          'g',
        );

        const matches = postData!.caption.match(regex);
        if (matches) {
          for (const m of matches) {
            const index = taggedUsers.findIndex((u) =>
              u.idWithToken.includes(m),
            );
            if (index !== -1) {
              captionWithTags = captionWithTags.replace(
                m,
                `@${taggedUsers[index].username}${separatorForTag}${taggedUsers[index].id}${tokenForTag}`,
              );
            }
          }
        }
      }

      let isLiked = false;
      if (currentUser) {
        const likeRef = await fsDB
          .collection('posts')
          .doc(postID)
          .collection('like_list')
          .doc(currentUser.id)
          .get();
        if (likeRef.exists) {
          isLiked = true;
        }
      }

      const post = {
        id: postRef.id,
        user: {
          id: postData!.posted_by,
          username: userData.username,
          avatar: userData.avatar,
        },
        caption: captionWithTags,
        datePosted: postData!.date_posted,
        timeLabel: convertTime(postData!.date_posted),
        likes: postData!.likes,
        comments: postData!.comments,
        media: postData!.media,
        isLiked,
        taggedUsers: postData!.tagged_users,
        privacy: postData!.privacy,
      };
      newPosts.push(post);
    } catch (err) {
      continue;
    }
  }
  return newPosts;
};

const docFStoCommentArray = async (
  docs: Array<FirebaseFirestoreTypes.QueryDocumentSnapshot>,
  currentUser?: {
    id: string;
    username: string;
    avatar: string;
  },
) => {
  const comments = [];
  for (const snapshot of docs) {
    try {
      const commentData = snapshot.data();
      let postedBy;
      if (currentUser) {
        postedBy = currentUser;
      } else {
        const userRef = await fsDB
          .collection('users')
          .doc(commentData!.posted_by)
          .get();
        if (!userRef.exists) {
          continue;
        }
        const userData = userRef.data();
        postedBy = {
          id: userRef.id,
          username: userData!.username as string,
          avatar: userData!.avatar as string,
        };
      }
      const comment = {
        id: snapshot.id,
        content: commentData!.content as string,
        datePosted: commentData!.date_posted as number,
        likes: commentData!.likes as number,
        replies: commentData!.replies as number,
        user: postedBy,
      };
      comments.push(comment);
    } catch (err) {
      continue;
    }
  }
  return comments;
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

const removeDuplicatesFromPostsArray = (arr: Array<Post>) => {
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

const removeDuplicatesFromUserResultsArray = (arr: Array<UserResult>) => {
  const filteredArr = arr.reduce((acc: Array<UserResult>, current) => {
    const x = acc.find((ur) => ur.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  return filteredArr;
};

const removeDuplicatesFromCommentsArray = (arr: Array<PostComment>) => {
  const filteredArr = arr.reduce((acc: Array<PostComment>, current) => {
    const x = acc.find((ur) => ur.id === current.id);
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
  checkUserResultListChanged,
  checkPostCommentListChanged,
  checkPostChanged,
  docFStoPostArray,
  docFBtoPostArray,
  alertDialog,
  filterImageArray,
  uploadMedia,
  deleteMedia,
  removeDuplicatesFromPostsArray,
  removeDuplicatesFromUserResultsArray,
  removeDuplicatesFromCommentsArray,
  wrapPostCaption,
  checkURL,
  openURL,
  generateSubstrForUsername,
  generateCaptionWithTagsAndUrls,
  docFStoCommentArray,
};
