import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendPostNotification = functions.database
  .ref("/posts/{postId}")
  .onCreate(async (snapshot) => {
    const post = snapshot.val();

    const payload = {
      notification: {
        title: `${post.userName} posted`,
        body: post.text || "New post added",
      },
    };

    const tokensSnap = await admin.database().ref("fcmTokens").once("value");

    const tokens = [];

    tokensSnap.forEach((user) => {
      tokens.push(user.val());
    });

    if (tokens.length === 0) return null;

    return admin.messaging().sendToDevice(tokens, payload);
  });