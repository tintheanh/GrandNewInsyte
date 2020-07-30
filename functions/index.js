const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseTools = require('firebase-tools');

admin.initializeApp();

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

exports.deleteUser = functions.https.onCall((data, context) => {
  const { uid } = data;

  if (!(typeof username === 'string') || uid.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid UID.');
  }

  return admin
    .auth()
    .deleteUser(uid)
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
      return admin
        .database()
        .ref(`users/${uid}/following_posts`)
        .child(postID)
        .set({ date_posted, posted_by: uid })
        .then(() =>
          admin
            .database()
            .ref(`users/${uid}/follower_list`)
            .once('value')
            .then((followerListSnapshot) => {
              followerListSnapshot.forEach((doc) => {
                const followerID = doc.key;
                admin
                  .database()
                  .ref(`users/${followerID}/following_posts`)
                  .child(postID)
                  .set({ date_posted, posted_by: uid })
                  .catch((err) => {});
              });
            })
            .catch((err) => console.log(err.code, err.message)),
        );
    }
    return Promise.resolve();
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

    // delete post from followers
    if (privacy !== 'private') {
      admin
        .database()
        .ref(`users/${uid}/following_posts`)
        .child(postID)
        .remove()
        .then(() => {
          admin
            .database()
            .ref(`users/${uid}/follower_list`)
            .once('value')
            .then((followerListSnapshot) => {
              followerListSnapshot.forEach((doc) => {
                const followerID = doc.key;
                admin
                  .database()
                  .ref(`users/${followerID}/following_posts`)
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
