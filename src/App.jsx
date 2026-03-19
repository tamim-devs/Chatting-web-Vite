import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react"; // ✅ add useState
import { getDatabase, ref, set } from "firebase/database";
import app from "./configuration/firebaseConfig";

import Login from "./pages/Login";
import Regestration from "./pages/Regestration";
import RootLayout from "./components/rootLayout/RootLayout";
import Home from "./pages/Home/Home";
import Chat from "./pages/chat/Chat";
import Settings from "./pages/setting/Settings";
import PrivateRoute from "./components/PrivateRoute";
import MyPost from "./pages/setting/MyPost";
import Meet from "./meet/Meet";
import AudioCall from "./meet/AudioCall";
import Notification from "./components/notification/Notification";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  listenForegroundMessage,
  requestPermissionAndToken,
} from "./utility/firebaseMessaging";

import { ToastContainer } from "react-toastify";

const App = () => {
  const [user, setUser] = useState(undefined); // 🔥 important

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase(app);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null); // 🔥 add this

      if (currentUser) {
        const token = await requestPermissionAndToken();

        if (token) {
          await set(ref(db, "fcmTokens/" + currentUser.uid), token);
        }
      }
    });

    listenForegroundMessage();

    return () => unsubscribe();
  }, []);

  // 🔄 loading state
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      <Routes>
        {/* 🔥 AUTO LOGIN FIX */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 🔥 LOGIN PROTECT */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login />}
        />

        <Route
          path="/regestration"
          element={user ? <Navigate to="/home" /> : <Regestration />}
        />

        {/* 🔒 PRIVATE ROUTES */}
        <Route
          element={
            <PrivateRoute>
              <RootLayout />
            </PrivateRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mypost" element={<MyPost />} />
          <Route path="/meet" element={<Meet />} />
          <Route path="/call" element={<AudioCall />} />
          <Route path="/notifications" element={<Notification />} />
        </Route>

        {/* 🔥 FIX THIS ALSO */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to="/home" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;