import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Regestration from "./pages/Regestration";
import RootLayout from "./components/rootLayout/RootLayout";
import Home from "./pages/Home/Home";
import Chat from "./pages/chat/Chat";
import Settings from "./pages/setting/Settings";
import PrivateRoute from "./components/PrivateRoute";
import { listenForegroundMessage } from "./utility/firebaseMessaging";
import MyPost from "./pages/setting/MyPost";

const App = () => {
  useEffect(() => {
    listenForegroundMessage(); 
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/regestration" element={<Regestration />} />

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
        <Route path="/mypost" element={<MyPost/>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
