import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "../configuration/firebaseConfig";
import { isChatOpen } from "./chatState";

const messaging = getMessaging(app);

// 🔑 REQUEST PERMISSION + GET TOKEN
export const requestPermissionAndToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:     "BK11Gli3EnfVshnsldnxhMz4zSIAYMKgXYlqi_WrfZkLihgyJ9GhXgVpG_M5gBXHaGTdboc-V2dS8ccbSF5uRqk",
    });

    console.log("FCM Token:", token);
    return token;
  } catch (err) {
    console.error("FCM Error:", err);
    return null;
  }
};

// 🔔 FOREGROUND MESSAGE LISTENER
export const listenForegroundMessage = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);

    // 🔕 Chat open → mute
    if (isChatOpen()) return;

    // 🔊 Chat closed → sound
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  });
};