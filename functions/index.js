const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseTools = require('firebase-tools');

admin.initializeApp();

/**
 * Method general substring array from username
 * @param username
 */
const generateSubstringForUsername = (username) => {
  const toLower = username.toLocaleLowerCase();
  const result = new Set();
  const len = toLower.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len + 1; j++) {
      result.add(toLower.slice(i, j));
    }
  }
  return [...result];
};

exports.checkUsername = functions.https.onCall((data, context) => {
  const { username } = data;
  if (!(typeof username === 'string') || username.length < 4) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Username must be at least 4 characters.',
    );
  }

  return admin
    .firestore()
    .collection('users')
    .where('username', '==', username)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        throw new functions.https.HttpsError(
          'already-exists',
          'Username is already in use.',
        );
      }
    })
    .catch((err) => {
      throw new functions.https.HttpsError(err.code, err.message);
    });
});

exports.handleCreatePostForFollowers = functions.firestore
  .document('posts/{postId}')
  .onCreate((snapshot, context) => {
    const newPost = snapshot.data();
    const postID = context.params.postId;
    const privacy = newPost.privacy;
    const date_posted = newPost.date_posted;
    const uid = newPost.posted_by;

    if (privacy !== 'private') {
      // put user's own post to their following post list
      return admin
        .database()
        .ref(`users/${uid}/following_posts`)
        .child(postID)
        .set({ date_posted, posted_by: uid })
        .then(() => {
          // add post reference to all following post lists of user's followers
          admin
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('follower_list')
            .listDocuments()
            .then((followerListRef) => {
              const usersRef = admin.database().ref('users');
              followerListRef.forEach((it) => {
                usersRef
                  .child(`${it.id}/${postID}`)
                  .set({ date_posted, posted_by: uid })
                  .catch((err) => {});
              });
            })
            .catch((err) => {});
        });
    }
    return Promise.resolve();
  });

exports.handleUserSignUp = functions.auth.user().onCreate((user) => {
  return admin
    .auth()
    .getUser(user.uid)
    .then((userRes) => {
      const { uid, email, displayName } = userRes;
      admin
        .firestore()
        .collection('users')
        .doc(uid)
        .set({
          avatar: '',
          name: '',
          email,
          username: displayName,
          bio: '',
          total_posts: 0,
          following: 0,
          followers: 0,
          for_search: generateSubstringForUsername(displayName),
        })
        .catch((err) => console.log(err.message));
    });
});

exports.handleDeletePost = functions.firestore
  .document('posts/{postId}')
  .onDelete((snapshot, context) => {
    const postData = snapshot.data();
    const postID = context.params.postId;
    const privacy = postData.privacy;
    const uid = postData.posted_by;
    const media = postData.media;

    // delete media from storage
    for (const md of media) {
      admin
        .storage()
        .bucket('gs://grandnewinsyte.appspot.com')
        .file(`users/${uid}/post_media/${md.id}`)
        .delete()
        .catch((err) => {});
    }

    // delete post from followers' following post lists
    if (privacy !== 'private') {
      admin
        .database()
        .ref(`users/${uid}/following_posts`)
        .child(postID)
        .remove()
        .then(() => {
          admin
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('follower_list')
            .listDocuments()
            .then((followerListRef) => {
              const usersRef = admin.database().ref('users');
              followerListRef.forEach((it) => {
                usersRef
                  .child(`${it.id}/following_posts`)
                  .child(postID)
                  .remove()
                  .catch((err) => {});
              });
            })
            .catch((err) => {});
        })
        .catch((err) => console.log(err.code, err.message));
    }

    // completely delete post (including all likes, comments, replies)
    return firebaseTools.firestore.delete(`posts/${postID}`, {
      project: 'grandnewinsyte',
      recursive: true,
      yes: true,
    });
  });

exports.handleDeleteComment = functions.firestore
  .document('posts/{postId}/comment_list/{commentId}')
  .onDelete((snapshot, context) => {
    const postID = context.params.postId;
    const commentID = context.params.commentId;
    return firebaseTools.firestore.delete(
      `posts/${postID}/comment_list/${commentID}`,
      {
        project: 'grandnewinsyte',
        recursive: true,
        yes: true,
      },
    );
  });

exports.handleDeleteReply = functions.firestore
  .document('posts/{postId}/comment_list/{commentId}/reply_list/{replyId}')
  .onDelete((snapshot, context) => {
    const postID = context.params.postId;
    const commentID = context.params.commentId;
    const replyID = context.params.replyId;
    return firebaseTools.firestore.delete(
      `posts/${postID}/comment_list/${commentID}/reply_list/${replyID}`,
      {
        project: 'grandnewinsyte',
        recursive: true,
        yes: true,
      },
    );
  });

exports.handleFollow = functions.firestore
  .document('users/{userId}/following_list/{followingId}')
  .onCreate((snapshot, context) => {
    const uid = context.params.userId;
    const followedUID = context.params.followingId;

    const followerdGuyRef = admin
      .firestore()
      .collection('users')
      .doc(followedUID);
    const myselfRef = admin.firestore().collection('users').doc(uid);
    admin.firestore().runTransaction(async (trans) => {
      const userDoc = await trans.get(followerdGuyRef);
      const myself = await trans.get(myselfRef);

      // update new follower number of followed guy
      const newFollowers = userDoc.data().followers + 1;
      trans.update(followerdGuyRef, { followers: newFollowers });

      // add myself to followed guy's follower list
      const myselfAboutToAddedRef = followerdGuyRef
        .collection('follower_list')
        .doc(uid);
      const myselfUsername = myself.data().username;
      trans.set(myselfAboutToAddedRef, {
        for_search: generateSubstringForUsername(myselfUsername),
      });
    });

    // add all followed guy's posts to myself's following posts
    return admin
      .firestore()
      .collection('posts')
      .where('posted_by', '==', followedUID)
      .where('privacy', 'in', ['followers', 'public'])
      .get()
      .then((postSnapshots) => {
        const followingPostsRef = admin
          .database()
          .ref(`users/${uid}/following_posts`);
        postSnapshots.forEach((doc) => {
          followingPostsRef
            .child(doc.id)
            .set({
              posted_by: followedUID,
              date_posted: doc.data().date_posted,
            })
            .catch((err) => {});
        });
      })
      .catch((err) => console.log(err.code, err.message));
  });

exports.handleUnfollow = functions.firestore
  .document('users/{userId}/following_list/{followingId}')
  .onDelete((snapshot, context) => {
    const uid = context.params.userId;
    const unfollowedUID = context.params.followingId;

    const unfollowerdGuyRef = admin
      .firestore()
      .collection('users')
      .doc(unfollowedUID);
    admin.firestore().runTransaction(async (trans) => {
      const userDoc = await trans.get(unfollowerdGuyRef);
      const newFollowers = userDoc.data().followers - 1;
      // update new follower number of the unfollowed guy
      trans.update(unfollowerdGuyRef, { followers: newFollowers });

      // remove myself from unfollowed guy's follower list
      const myselfAboutToDeletedRef = unfollowerdGuyRef
        .collection('follower_list')
        .doc(uid);
      trans.delete(myselfAboutToDeletedRef);
    });

    // remove all unfollowed guy's posts from myself's following posts
    return admin
      .database()
      .ref(`users/${uid}/following_posts`)
      .once('value')
      .then((postSnapshots) => {
        const postIDs = [];
        postSnapshots.forEach((doc) => {
          if (doc.val().posted_by === unfollowedUID) {
            postIDs.push(doc.key);
          }
        });
        const followingPostsRef = admin
          .database()
          .ref(`users/${uid}/following_posts`);
        postIDs.forEach((id) =>
          followingPostsRef
            .child(id)
            .remove()
            .catch((err) => {}),
        );
      })
      .catch((err) => console.log(err.code, err.message));
  });
