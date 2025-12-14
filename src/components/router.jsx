// src/routes/router.jsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/rootLayout/RootLayout";
import Home from "../pages/Home/Home";
import Chat from "../pages/chat/Chat";
import Settings from "../pages/setting/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path : "settings",
        element: <Settings/>
      },
     
     
    ],
  },
]);
