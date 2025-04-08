import { initializeApp } from "firebase/app";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDD2Qmatm3mUZMFplKSV2K1CfI-AoRl8zQ",
  authDomain: "chat-web-871ab.firebaseapp.com",
  projectId: "chat-web-871ab",
  storageBucket: "chat-web-871ab.firebasestorage.app",
  messagingSenderId: "475579719210",
  appId: "1:475579719210:web:3498711e803ab192ef6d53"
};
console.log("Running Firebase");


export const DbApp = initializeApp(firebaseConfig);