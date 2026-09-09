import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  // Firebase Console থেকে EXACT config এখানে বসাবে
  apiKey: "YOUR_NEW_API_KEY",
  authDomain: "chatting-web-514fb.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "chatting-web-514fb",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "344338779469",
  appId: "YOUR_NEW_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;