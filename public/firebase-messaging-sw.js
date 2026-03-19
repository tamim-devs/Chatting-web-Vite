importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDD2Qmatm3mUZMFplKSV2K1CfI-AoRl8zQ",
  authDomain: "chat-web-871ab.firebaseapp.com",
  projectId: "chat-web-871ab",
  messagingSenderId: "475579719210",
  appId: "1:475579719210:web:3498711e803ab192ef6d53",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});