const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/* 🔔 MESSAGE NOTIFICATION */
exports.sendMessageNotification = functions.database
  .ref("/singleMsg/{msgId}")
  .onCreate(async (snapshot) => {
    const msg = snapshot.val();

    const receiverId = msg.whoRecivedMsgUid;

    const userSnap = await admin
      .database()
      .ref(`users/${receiverId}`)
      .once("value");

    const token = userSnap.val()?.fcmToken;
    if (!token) return null;

    return admin.messaging().sendToDevice(token, {
      notification: {
        title: "📩 New Message",
        body: msg.msg || "📷 Image Message",
      },
    });
  });

/* ❤️ STORY LIKE */
exports.storyLikeNotification = functions.database
  .ref("/storyLikes/{likeId}")
  .onCreate(async (snapshot) => {
    const data = snapshot.val();

    const userSnap = await admin
      .database()
      .ref(`users/${data.storyOwnerUid}`)
      .once("value");

    const token = userSnap.val()?.fcmToken;
    if (!token) return null;

    return admin.messaging().sendToDevice(token, {
      notification: {
        title: "❤️ Story Like",
        body: `${data.likerName} liked your story`,
      },
    });
  });

/* 💬 STORY REPLY */
exports.storyReplyNotification = functions.database
  .ref("/storyReplies/{replyId}")
  .onCreate(async (snapshot) => {
    const data = snapshot.val();

    const userSnap = await admin
      .database()
      .ref(`users/${data.storyOwnerUid}`)
      .once("value");

    const token = userSnap.val()?.fcmToken;
    if (!token) return null;

    return admin.messaging().sendToDevice(token, {
      notification: {
        title: "💬 Story Reply",
        body: `${data.senderName} replied to your story`,
      },
    });
  });
