import React from "react";
import Regestration from "./pages/Regestration";
import Login from "./pages/Login";
import RootLayout from "./components/rootLayout/RootLayout";
import Home from "./pages/Home/Home";
import Chat from "./pages/chat/Chat";
import Settings from "./pages/setting/Settings";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>

        {/* 🔐 PUBLIC ROUTES */}
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/regestration" element={<Regestration />} />

        {/* 🔒 PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <RootLayout />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="chat" element={<Chat />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
