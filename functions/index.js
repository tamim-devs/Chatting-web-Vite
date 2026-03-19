const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/* 🔔 MESSAGE NOTIFICATION */
exports.sendMessageNotification = functions.database
  .ref("/singleMsg/{msgId}")
  .onCreate(async (snapshot) => {
    const msg = snapshot.val();
    const receiverId = msg.whoRecivedMsgUid;

    const tokenSnap = await admin
      .database()
      .ref(`fcmTokens/${receiverId}`)
      .once("value");

    const token = tokenSnap.val();
    if (!token) return null;

    return admin.messaging().sendToDevice(token, {
      notification: {
        title: "📩 New Message",
        body: msg.msg || "📷 Image Message",
      },
    });
  });

/* ❤️ STORY LIKE NOTIFICATION */
exports.storyLikeNotification = functions.database
  .ref("/storyLikes/{likeId}")
  .onCreate(async (snapshot) => {
    const data = snapshot.val();
    const receiverId = data.storyOwnerUid;

    const tokenSnap = await admin
      .database()
      .ref(`fcmTokens/${receiverId}`)
      .once("value");

    const token = tokenSnap.val();
    if (!token) return null;

    return admin.messaging().sendToDevice(token, {
      notification: {
        title: "❤️ Story Like",
        body: `${data.likerName} liked your story`,
      },
    });
  });

/* 💬 STORY REPLY NOTIFICATION */
exports.storyReplyNotification = functions.database
  .ref("/storyReplies/{replyId}")
  .onCreate(async (snapshot) => {
    const data = snapshot.val();
    const receiverId = data.storyOwnerUid;

    const tokenSnap = await admin
      .database()
      .ref(`fcmTokens/${receiverId}`)
      .once("value");

    const token = tokenSnap.val();
    if (!token) return null;

    return admin.messaging().sendToDevice(token, {
      notification: {
        title: "💬 Story Reply",
        body: `${data.senderName} replied to your story`,
      },
    });
  });

/* 📢 POST NOTIFICATION (FOR ALL USERS EXCEPT OWNER) */
exports.postNotification = functions.database
  .ref("/posts/{postId}")
  .onCreate(async (snapshot) => {
    const post = snapshot.val();

    const tokensSnap = await admin
      .database()
      .ref("fcmTokens")
      .once("value");

    const tokens = [];

    tokensSnap.forEach((child) => {
      if (child.key !== post.uid) {
        const token = child.val();
        if (token) tokens.push(token);
      }
    });

    console.log("TOKENS:", tokens);

    if (tokens.length === 0) return null;

    return admin.messaging().sendToDevice(tokens, {
      notification: {
        title: `${post.userName || "Someone"} posted`,
        body: post.text
          ? post.text.substring(0, 100)
          : "New post added",
      },
    });
  });