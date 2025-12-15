import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "../configuration/firebaseConfig";

const messaging = getMessaging(app);

export const requestPermissionAndToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: "BK11Gli3EnfVshnsldnxhMz4zSIAYMKgXYlqi_WrfZkLihgyJ9GhXgVpG_M5gBXHaGTdboc-V2dS8ccbSF5uRqk",
    });

    return token;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// 🔔 FOREGROUND MESSAGE LISTENER + SOUND
export const listenForegroundMessage = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);

    // 🔊 SOUND
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {
      console.log("Autoplay blocked");
    });
  });
};
