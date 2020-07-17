const functions = require('firebase-functions');
const admin = require('firebase-admin');

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

exports.handleCreatePostForFollowers = functions.https.onCall(
  (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called ' + 'while authenticated.',
      );
    }

    const { postID, date_posted } = data;
    if (!(typeof postID === 'string') || postID.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid Post ID.',
      );
    }

    const { uid } = context.auth;

    return admin
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
            .set({
              date_posted,
            })
            .catch((err) => {});
        });
      })
      .catch((err) => {
        throw new functions.https.HttpsError(err.code, err.message);
      });
  },
);

exports.handleDeletePostForFollowers = functions.https.onCall(
  (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called ' + 'while authenticated.',
      );
    }

    const { postID } = data;
    if (!(typeof postID === 'string') || postID.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid Post ID.',
      );
    }

    const { uid } = context.auth;

    return admin
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
          .catch((err) => {
            throw new functions.https.HttpsError(err.code, err.message);
          });
      })
      .catch((err) => {
        throw new functions.https.HttpsError(err.code, err.message);
      });
  },
);
