import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
const firebaseConfig = {
  apiKey: "AIzaSyDD2Qmatm3mUZMFplKSV2K1CfI-AoRl8zQ",
  authDomain: "chat-web-871ab.firebaseapp.com",
  databaseURL: "https://chat-web-871ab-default-rtdb.firebaseio.com",
  projectId: "chat-web-871ab",
  storageBucket: "chat-web-871ab.appspot.com",
  messagingSenderId: "475579719210",
  appId: "1:475579719210:web:3498711e803ab192ef6d53",
};

// ✅ Initialize app ONLY ONCE
const app = initializeApp(firebaseConfig);

// ✅ Export services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export default app;
