import { getMessaging, getToken } from "firebase/messaging";
import app from "../configuration/firebaseConfig"; 

const messaging = getMessaging(app);

export const requestPermissionAndToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BK11Gli3EnfVshnsldnxhMz4zSIAYMKgXYlqi_WrfZkLihgyJ9GhXgVpG_M5gBXHaGTdboc-V2dS8ccbSF5uRqk",
    });

    if (token) {
      console.log("FCM TOKEN:", token);
      return token;
    }

    return null;
  } catch (err) {
    console.error("FCM Error:", err);
    return null;
  }
};
