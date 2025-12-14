// src/components/rootLayout/RootLayout.jsx
import { Outlet } from "react-router-dom";
import HomeLeft from "../HomeComponents/HomeLeft/HomeLeft";

const RootLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <HomeLeft/>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
