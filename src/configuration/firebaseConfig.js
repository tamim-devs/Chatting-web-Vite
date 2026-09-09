import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCfPazwowu4ShFGQ3pUFIVeRvbOCpSsd-4",
  authDomain: "chatting-web-514fb.firebaseapp.com",
  databaseURL: "https://chatting-web-514fb-default-rtdb.firebaseio.com",
  projectId: "chatting-web-514fb",
  storageBucket: "chatting-web-514fb.firebasestorage.app",
  messagingSenderId: "344338779469",
  appId: "1:344338779469:web:d9f7cfe3b18bf1d6623b04",
  measurementId: "G-934WQSV1RQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;