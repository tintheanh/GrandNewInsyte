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
import {
  Post,
  UserResult,
  Comment,
  Reply,
  User,
  MyError,
  MyErrorCodes,
} from '../models';
import { Colors, tokenForTag, separatorForTag } from '../constants';

/**
 * Method ramdomly throw dummy error for testing
 */
const randomlyThrowError = () => {
  const percentage = Math.round(Math.random() * 99) + 1;
  console.log(percentage);
  if (percentage > 50) {
    throw new Error('Fake error.');
  }
};

const alertDialog = (alertText: string, callback?: (args?: any) => void) => {
  Alert.alert(
    '',
    alertText,
    [
      {
        text: 'OK',
        style: 'cancel',
        onPress: callback,
      },
    ],
    { cancelable: true },
  );
};

/**
 * Method check if email is valid
 * @param email
 */
const isEmailValid = (email: string) => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email.toLowerCase());
};

/**
 * Method check if password is valid
 * @param password
 */
const isPasswordValid = (password: string) => {
  return password.length >= 6;
};

/**
 * Method check if username is valid
 * @param username
 */
const isUsernameValid = (username: string) => {
  const regex = /^(?=[a-z_\d]*[a-z])[a-z_\d]{4,}$/;
  return regex.test(username);
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

/**
 * Method general substring array from username
 * @param username
 */
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
      const username = noLinkSymbol[0].split('@')[1];
      const uid = noLinkSymbol[1].replace(tokenForTag, '');

      return {
        type: 'tag',
        value: {
          text: noLinkSymbol[0],
          uid,
          username,
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

/**
 * Method fetch signed in user data
 * @param uid user id to fetch
 */
const fetchMyself = async (uid: string): Promise<User> => {
  try {
    const userRef = await fsDB.collection('users').doc(uid).get();

    if (!userRef.exists) {
      throw new MyError('User not found.', MyErrorCodes.DataNotFound);
    }

    const userData = userRef.data();
    const user = {
      id: uid,
      avatar: userData!.avatar as string,
      email: '', // email does not belong in firestore, get it later
      name: userData!.name as string,
      username: userData!.username as string,
      bio: userData!.bio as string,
      followers: userData!.followers as number,
      following: userData!.following as number,
      totalPosts: userData!.total_posts as number,
    };
    return user;
  } catch (err) {
    throw err;
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
  list1: Array<Comment>,
  list2: Array<Comment>,
) => {
  if (list1.length !== list2.length) {
    return true;
  }

  const len = list1.length;
  for (let i = 0; i < len; i++) {
    const comment1 = list1[i];
    const comment2 = list2[i];

    if (
      comment1.id !== comment2.id ||
      comment1.likes !== comment2.likes ||
      comment1.replies !== comment2.replies
    ) {
      return true;
    }
  }

  return false;
};

const checkPostReplyListChanged = (
  list1: Array<Reply>,
  list2: Array<Reply>,
) => {
  if (list1.length !== list2.length) {
    return true;
  }

  const len = list1.length;
  for (let i = 0; i < len; i++) {
    const reply1 = list1[i];
    const reply2 = list2[i];

    if (reply1.id !== reply2.id || reply1.likes !== reply2.likes) {
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

/**
 * Method check if two posts are different
 * @param post1
 * @param post2
 */
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

const checkCommentChanged = (comment1: Comment, comment2: Comment) => {
  if (
    comment1.isLiked !== comment2.isLiked ||
    comment1.likes !== comment2.likes ||
    comment1.replies !== comment2.replies
  ) {
    return true;
  }
  return false;
};

/**
 * Method get current user
 * @returns null if there's no signed in user
 */
const getCurrentUser = () => {
  return new Promise<FirebaseAuthTypes.User | null>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Method firestore docs to post array
 * @param docs Firestore docs
 * @param currentUser Can be used to save getting user data
 * if the post's owner is the same as the current user
 */
const FSdocsToPostArray = async (
  docs: Array<FirebaseFirestoreTypes.QueryDocumentSnapshot>,
  currentUser: {
    id: string;
    username: string;
    avatar: string;
  } | null = null,
): Promise<Array<Post>> => {
  const newPosts = [];

  for (const doc of docs) {
    const postData = doc.data();
    let userData = null;
    try {
      if (currentUser && currentUser.id === postData!.posted_by) {
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

/**
 * Method generate post array from post ids
 * @param postIDs
 * @param currentUser
 */
const postIDsToPostArray = async (
  postIDs: Array<string>,
  currentUser: {
    id: string;
    username: string;
    avatar: string;
  } | null = null,
): Promise<Array<Post>> => {
  const newPosts = [];
  for (const postID of postIDs) {
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

/**
 * Method get array of comments from firestore documents
 * @param postID Post's ID where comments are fetched from
 * @param docs Firestore documents
 * @param currentUser preload current user
 */
const FSdocsToCommentArray = async (
  postID: string,
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
      if (currentUser && currentUser.id === commentData!.posted_by) {
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
      let isLiked = false;
      if (currentUser) {
        const likeRef = await fsDB
          .collection('posts')
          .doc(postID)
          .collection('comment_list')
          .doc(snapshot.id)
          .collection('like_list')
          .doc(currentUser.id)
          .get();
        if (likeRef.exists) {
          isLiked = true;
        }
      }

      const comment = {
        id: snapshot.id,
        content: commentData!.content as string,
        datePosted: commentData!.date_posted as number,
        likes: commentData!.likes as number,
        isLiked,
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

/**
 * Method get reply array from firestore documents
 * @param postID Parent post's ID of the replies
 * @param commentID Parent comment's ID of the replies
 * @param docs Firestore documents
 * @param currentUser Preload user
 */
const FSdocsToReplyArray = async (
  postID: string,
  commentID: string,
  docs: Array<FirebaseFirestoreTypes.QueryDocumentSnapshot>,
  currentUser?: {
    id: string;
    username: string;
    avatar: string;
  },
) => {
  const replies = [];
  for (const snapshot of docs) {
    try {
      const replyData = snapshot.data();
      let postedBy;
      if (currentUser && currentUser.id === replyData!.posted_by) {
        postedBy = currentUser;
      } else {
        const userRef = await fsDB
          .collection('users')
          .doc(replyData!.posted_by)
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
      let isLiked = false;
      if (currentUser) {
        const likeRef = await fsDB
          .collection('posts')
          .doc(postID)
          .collection('comment_list')
          .doc(commentID)
          .collection('reply_list')
          .doc(snapshot.id)
          .collection('like_list')
          .doc(currentUser.id)
          .get();
        if (likeRef.exists) {
          isLiked = true;
        }
      }

      const reply = {
        id: snapshot.id,
        content: replyData!.content as string,
        datePosted: replyData!.date_posted as number,
        likes: replyData!.likes as number,
        isLiked,
        user: postedBy,
      };
      replies.push(reply);
    } catch (err) {
      continue;
    }
  }
  return replies;
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

/**
 * Method to remove duplicates from array by id
 * @param arr Array to remove duplicates
 */
const removeDuplicatesFromArray = (arr: Array<any>) => {
  const filteredArr = arr.reduce((acc: Array<any>, current) => {
    if (!current.id) {
      return arr;
    }
    const x = acc.find((element) => element.id === current.id);
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
  randomlyThrowError,
  isEmailValid,
  isPasswordValid,
  convertTime,
  convertNumber,
  fetchMyself,
  delay,
  getCurrentUser,
  isUsernameValid,
  getCurrentUnixTime,
  checkPostListChanged,
  checkUserResultListChanged,
  checkPostCommentListChanged,
  checkPostChanged,
  FSdocsToPostArray,
  postIDsToPostArray,
  alertDialog,
  filterImageArray,
  uploadMedia,
  deleteMedia,
  removeDuplicatesFromArray,
  wrapPostCaption,
  checkURL,
  openURL,
  generateSubstringForUsername,
  generateCaptionWithTagsAndUrls,
  FSdocsToCommentArray,
  FSdocsToReplyArray,
  checkPostReplyListChanged,
  checkCommentChanged,
};
