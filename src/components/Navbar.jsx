import React from "react";
import { FiHome, FiHeart } from "react-icons/fi";
import { RiShutDownFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { IoSettings } from "react-icons/io5";

const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirect to login
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">

        {/* LOGO */}
        <button
          onClick={() => navigate("/home")}
          className="text-lg sm:text-2xl font-black text-slate-900"
        >
          Meher Ali Family
        </button>

        {/* ICONS */}
        <div className="flex items-center gap-3 sm:gap-4 text-slate-700">

          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <FiHome size={20} />
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="p-2  text-blue-600 rounded-full hover:bg-slate-100"
          >
            <IoSettings size={20} />
          </button>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-100 text-red-500"
            title="Logout"
          >
            <RiShutDownFill size={20} />
          </button>

        </div>
      </div>
    </header>
  );
};

export default Navbar;