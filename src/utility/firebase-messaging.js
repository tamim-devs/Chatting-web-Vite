import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../configuration/firebaseConfig";
import { getDatabase, ref, set } from "firebase/database";
import app from "../configuration/firebaseConfig";

/* 🔥 REQUEST PERMISSION + SAVE TOKEN */
export const requestPermissionAndToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BK11Gli3EnfVshnsldnxhMz4zSIAYMKgXYlqi_WrfZkLihgyJ9GhXgVpG_M5gBXHaGTdboc-V2dS8ccbSF5uRqk",
    });

    if (!token) {
      console.log("❌ No token found");
      return;
    }

    console.log("✅ FCM TOKEN:", token);

    const db = getDatabase(app);

    // 🔥 Save token properly
    await set(ref(db, "fcmTokens/" + userId), token);

  } catch (error) {
    console.log("❌ Permission error:", error);
  }
};

/* 🔔 FOREGROUND NOTIFICATION */
export const listenForegroundMessage = () => {
  onMessage(messaging, (payload) => {
    console.log("📩 Notification:", payload);

   
    alert(
      `${payload.notification.title} - ${payload.notification.body}`
    );
  });
};